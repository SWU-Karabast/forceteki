import { vectorGate } from './swuPgnVectorGate';
import { fold, stateAt } from '../../../swupgn/src/fold';

/**
 * The real-game vectors (spec §20): organic games -- natural setup phase, plays, attacks and
 * regroups, no GameStateBuilder mid-game override -- each built around one thing a reader has to
 * get right, and each pinned to the `.fold.json` / `.render.txt` the reference reader derives
 * from the writer's output. `SwuPgnOrganicGame.spec.ts` contributes the fourth (`organic`).
 *
 *   upgrades  a printed upgrade, an Experience token, Advantage tokens and Shield tokens, and the
 *             hosts that carried them defeated with everything still attached
 *   pilot     a pilot flown onto a vehicle as an upgrade, and the vehicle then Vanquished
 *   capture   a unit captured with Take Captive, and rescued when its captor is defeated
 *   arrest    a unit captured by a BASE (Arrest), held in `baseCaptured`, and rescued at the regroup
 *   effects   lasting effects on bases and units, a partial end, an `until`, a blank
 *   visibility  LOOK, SEARCH.seen, NAME, blind choices with a simul discard, and usedBy
 *   control   an upgrade and a unit taken, a limited ability, a gained trait, a copy, a foreign resource
 *
 * The games are scripted adaptively -- each turn picks from what the engine says is playable --
 * on a fixed seed, so they are deterministic, and each asserts the situation it exists for
 * actually happened (so a card-data change that changes the story fails loudly rather than
 * silently pinning a different game). Regenerate with `SWUPGN_WRITE_VECTORS=1`.
 */

// Decks are built on-aspect for their leader + base, so the cards each scenario needs are
// affordable when the script reaches for them: a two-aspect penalty turns a 2-cost unit into a
// 6-cost one, and the first attempt at these games was three rounds of passing.
const VILLAIN = ['death-star-stormtrooper', 'death-star-stormtrooper', 'death-star-stormtrooper', 'death-star-stormtrooper'];
const REBEL = ['alliance-xwing', 'alliance-xwing', 'alliance-xwing', 'alliance-xwing'];

/** A card in `p`'s hand the engine currently lets them play, by internal name. */
function playable(p: any, ...names: string[]): any {
    const targets: any[] = p.currentActionTargets ?? [];
    for (const name of names) {
        const card = targets.find((c) => c.zoneName === 'hand' && c.internalName === name);
        if (card) {
            return card;
        }
    }
    return undefined;
}

function arenaUnits(p: any): any[] {
    return p.player.getArenaUnits();
}

/** Click the first of `preferred` that the prompt offers, else the first thing it offers. */
function pick(p: any, preferred: any[] = []): void {
    const offered: any[] = p.currentActionTargets ?? [];
    const choice = preferred.find((c) => offered.includes(c)) ?? offered[0];
    if (choice) {
        p.clickCard(choice);
    }
}

/**
 * Bring the acting player's turn to a close: answer the prompts an action leaves behind until
 * priority passes to the opponent (or the phase ends). Targets go to `preferred` when offered.
 */
function settle(p: any, preferred: any[] = []): void {
    for (let i = 0; i < 8 && p.canAct && p.game.currentPhase === 'action'; i++) {
        if (p.hasPrompt('Choose an action')) {
            return;
        }
        const buttons: string[] = p.currentButtons ?? [];
        const resolveAll = buttons.find((b) => b.startsWith('Resolve all'));
        if (resolveAll) {
            p.clickPrompt(resolveAll);
            continue;
        }
        if ((p.currentActionTargets ?? []).length > 0) {
            pick(p, preferred);
            continue;
        }
        if (buttons.some((b) => b.toLowerCase() === 'done')) {
            p.clickDone();
            continue;
        }
        return;
    }
}

/** Attack the opposing base with the first ready unit, if any. */
function attackBase(p: any, enemyBase: any): boolean {
    const attackers = (p.currentActionTargets ?? []).filter((c: any) => c.isUnit?.() && c.isInPlay?.());
    if (attackers.length === 0) {
        return false;
    }
    p.clickCard(attackers[0]);
    settle(p, [enemyBase]);
    return true;
}

/** What each seat must not resource away: the cards its scenario is about. */
interface Keep {
    p1: string[]; p2: string[];
}

/** Resource `n` cards from the prompt, filler first, so the scenario's own cards stay in hand. */
function resourceCards(p: any, n: number, keep: string[]): void {
    for (let i = 0; i < n; i++) {
        const offered: any[] = (p.currentActionTargets ?? []).filter((c: any) => !p.selectedCards.includes(c));
        const choice = offered.find((c) => !keep.includes(c.internalName)) ?? offered[0];
        if (choice) {
            p.clickCard(choice);
        }
    }
    p.clickDone();
}

/** Natural setup: P1 takes initiative, both keep, both resource two. */
function runSetup(context: any, seed: string, keep: Keep): void {
    const game: any = context.game;
    game.setRandomSeed(seed);
    context.selectInitiativePlayer(context.player1);
    context.player1.clickPrompt('Keep');
    context.player2.clickPrompt('Keep');
    resourceCards(context.player1, 2, keep.p1);
    resourceCards(context.player2, 2, keep.p2);
    expect(game.currentPhase).toBe('action');
}

/** Play `rounds` action phases with `takeTurn`, resourcing one card each regroup, then concede. */
function runRounds(context: any, rounds: number, keep: Keep, takeTurn: (p: any) => void): string {
    const game: any = context.game;
    const active = () => (context.player1.canAct ? context.player1 : context.player2);
    for (let round = 1; round <= rounds; round++) {
        let guard = 0;
        while (game.currentPhase === 'action' && guard++ < 60) {
            takeTurn(active());
        }
        expect(game.currentPhase).withContext(`round ${round} did not end`)
            .toBe('regroup');
        resourceCards(context.player1, context.player1.hand.length > 0 ? 1 : 0, keep.p1);
        resourceCards(context.player2, context.player2.hand.length > 0 ? 1 : 0, keep.p2);
        expect(game.currentPhase).toBe('action');
    }
    game.concede(context.player2.id);
    context.ignoreUnresolvedActionPhasePrompts = true;
    return game.getCachedSwuPgn();
}

const byType = (doc: any, t: string): any[] => doc.events.filter((e: any) => e.t === t);

/** Whether `p` has something to answer: any prompt but a "waiting for the opponent" one. */
function acting(p: any): boolean {
    const prompt = p.currentPrompt();
    const title = typeof prompt.menuTitle === 'function' ? prompt.menuTitle(p.player.context) : prompt.menuTitle;
    return !(/^Waiting for opponent/i).test(title ?? '');
}

/** The seat whose prompt the game is waiting on. */
function actor(context: any): any {
    return acting(context.player1) && !acting(context.player2) ? context.player1
        : acting(context.player2) && !acting(context.player1) ? context.player2
            : (context.player1.canAct ? context.player1 : context.player2);
}

interface Answers {

    /** Cards to prefer whenever cards are offered. */
    prefer?: any[];

    /** The list option to name, when a card asks for a name. */
    name?: string;
}

/**
 * Answer every prompt between an action and the next "Choose an action", whichever seat it is
 * for: optional triggers are taken, a name is picked from the list, cards looked at go back on
 * top, a search takes the first card it may, and other targets go to `prefer` when offered.
 */
function answerAll(context: any, answers: Answers = {}): void {
    const game: any = context.game;
    for (let i = 0; i < 40 && game.currentPhase === 'action' && !game.isEnded; i++) {
        const p = actor(context);
        if (p.hasPrompt('Choose an action')) {
            return;
        }
        const prompt = p.currentPrompt();
        const buttons: string[] = p.currentButtons ?? [];
        const resolveAll = buttons.find((b) => b.startsWith('Resolve all'));
        if (resolveAll) {
            p.clickPrompt(resolveAll);
            continue;
        }
        if (buttons.includes('Trigger')) {
            p.clickPrompt('Trigger');
            continue;
        }
        if ((prompt.dropdownListOptions ?? []).length > 0) {
            const options: string[] = prompt.dropdownListOptions;
            p.chooseListOption(options.includes(answers.name) ? answers.name : options[0]);
            continue;
        }
        if ((prompt.displayCards ?? []).length > 0) {
            const perCard = prompt.perCardButtons ?? [];
            if (perCard.length > 0) {
                p.clickDisplayCardPromptButton(prompt.displayCards[0].cardUuid, perCard[0].arg);
                continue;
            }
            const selectable = prompt.displayCards.find((c: any) => c.selectionState === 'selectable');
            if (selectable && !(p.selectedCards ?? []).some((c: any) => c.uuid === selectable.cardUuid)) {
                p.clickCardInDisplayCardPrompt({ uuid: selectable.cardUuid, internalName: selectable.internalName });
                continue;
            }
            const finish = buttons.find((b) => ['Done', 'Take nothing'].includes(b));
            if (finish) {
                p.clickPrompt(finish);
                continue;
            }
            return;
        }
        const offered: any[] = (p.currentActionTargets ?? []).filter((c: any) => !(p.selectedCards ?? []).includes(c));
        const done = buttons.find((b) => b.toLowerCase() === 'done');
        if (offered.length > 0 && !(done && (p.selectedCards ?? []).length > 0)) {
            p.clickCard((answers.prefer ?? []).find((c) => offered.includes(c)) ?? offered[0]);
            continue;
        }
        if (done) {
            p.clickDone();
            continue;
        }
        return;
    }
}

/** Play `rounds` action phases, each turn by whichever seat `takeTurn` is handed; resource one card per regroup; concede. */
function playRounds(context: any, rounds: number, keep: Keep, takeTurn: (p: any) => void): string {
    const game: any = context.game;
    for (let round = 1; round <= rounds; round++) {
        let guard = 0;
        while (game.currentPhase === 'action' && guard++ < 80) {
            const p = actor(context);
            if (!p.hasPrompt('Choose an action')) {
                answerAll(context);
                continue;
            }
            takeTurn(p);
        }
        expect(game.currentPhase).withContext(`round ${round} did not end`)
            .toBe('regroup');
        resourceCards(context.player1, context.player1.hand.length > 0 ? 1 : 0, keep.p1);
        resourceCards(context.player2, context.player2.hand.length > 0 ? 1 : 0, keep.p2);
        expect(game.currentPhase).toBe('action');
    }
    game.concede(context.player2.id);
    context.ignoreUnresolvedActionPhasePrompts = true;
    return game.getCachedSwuPgn();
}

describe('SWU-PGN/1.0 vectors (real games)', function () {
    // ── upgrades ──────────────────────────────────────────────────────────────────────────────
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'setup',
                player1: {
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'echo-base',
                    deck: [
                        'zealous-soldier', 'zealous-soldier', 'zealous-soldier',
                        'clan-wren-rescuer', 'clan-wren-rescuer',
                        'ascension-cable', 'ascension-cable', 'ascension-cable',
                        'cloaked-starviper', 'cloaked-starviper',
                        'battlefield-marine', 'battlefield-marine', ...REBEL,
                    ],
                },
                player2: {
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    base: 'security-complex',
                    // No Sentinels: P1's attacks must be free to go at the base, or its hosts die
                    // before the printed upgrade lands on one.
                    deck: ['open-fire', 'open-fire', 'open-fire', 'vanquish', 'vanquish',
                        'death-star-stormtrooper', 'death-star-stormtrooper', 'death-star-stormtrooper', ...VILLAIN, ...VILLAIN],
                },
            });
        });

        it('upgrades: tokens and a printed upgrade on hosts that are then defeated', function () {
            const { context } = contextRef;
            const keep: Keep = { p1: ['zealous-soldier', 'clan-wren-rescuer', 'ascension-cable', 'cloaked-starviper'], p2: ['open-fire', 'vanquish'] };
            runSetup(context, 'swu-pgn-vector-upgrades', keep);
            const p1 = context.player1;
            const p2 = context.player2;
            const withMost = (units: any[]) => [...units].sort((a, b) => b.upgrades.length - a.upgrades.length)[0];

            const hasPrintedUpgrade = (u: any) => u.upgrades.some((x: any) => !x.isToken?.());
            const takeTurn = (p: any): void => {
                if (p === p1) {
                    const hosts = arenaUnits(p1).filter((u) => u.zoneName === 'groundArena');
                    // A host first; then the printed upgrade onto the most-decorated host; then
                    // more tokens; then the Shield-bearing ship; then bodies.
                    let card = hosts.length === 0 ? playable(p1, 'zealous-soldier', 'battlefield-marine', 'clan-wren-rescuer') : undefined;
                    card = card ?? (hosts.length > 0 && !hosts.some(hasPrintedUpgrade) ? playable(p1, 'ascension-cable') : undefined);
                    card = card ?? playable(p1, 'cloaked-starviper', 'zealous-soldier', 'clan-wren-rescuer', 'battlefield-marine', 'alliance-xwing');
                    if (card) {
                        p1.clickCard(card);
                        settle(p1, [withMost(hosts), ...hosts]);
                        return;
                    }
                    // Attack with a bare unit so the decorated hosts stay alive for P2 to remove.
                    const bare = (p1.currentActionTargets ?? []).filter((c: any) => c.isUnit?.() && c.isInPlay?.() && c.upgrades.length === 0);
                    if (bare.length > 0) {
                        p1.clickCard(bare[0]);
                        settle(p1, [context.p2Base]);
                        return;
                    }
                    p1.passAction();
                    return;
                }
                const enemies = arenaUnits(p1);
                // Remove a host once it carries the printed upgrade (or, from round 4, whatever
                // carries the most), so the removal of an attached printed card gets recorded.
                const target = enemies.find(hasPrintedUpgrade) ?? (context.game.roundNumber >= 4 ? withMost(enemies.filter((u) => u.upgrades.length > 0)) : undefined);
                let card = target ? playable(p2, 'open-fire', 'vanquish') : undefined;
                card = card ?? playable(p2, 'death-star-stormtrooper');
                if (card) {
                    p2.clickCard(card);
                    settle(p2, target ? [target, ...enemies] : enemies);
                    return;
                }
                // P2 never attacks here: five 1-cost Stormtroopers swinging every round razed
                // the base by round 3, before the removal spells had anything to remove.
                p2.passAction();
            };

            const doc = vectorGate('upgrades', runRounds(context, 4, keep, takeTurn));

            // The situation this vector exists for actually happened.
            expect(byType(doc, 'PLAY_UPGRADE').length).withContext('a printed upgrade was played')
                .toBeGreaterThan(0);
            expect(byType(doc, 'STATUS_TOKEN').some((e) => e.token === 'advantage' && e.count > 0)).withContext('an Advantage token was gained')
                .toBe(true);
            expect(byType(doc, 'EXPERIENCE_GAIN').some((e) => e.count > 0)).withContext('an Experience token was gained')
                .toBe(true);
            expect(byType(doc, 'SHIELD_GAIN').length).withContext('a Shield was gained')
                .toBeGreaterThan(0);
            const defeatedHosts = new Set(byType(doc, 'DEFEAT').map((e) => e.card));
            const hostsWithUpgrade = new Set(byType(doc, 'PLAY_UPGRADE').map((e) => e.target));
            expect([...hostsWithUpgrade].some((h) => defeatedHosts.has(h))).withContext('a host carrying a printed upgrade was defeated')
                .toBe(true);
            expect(byType(doc, 'EXHAUST_RESOURCES').length).toBeGreaterThan(0);
        });
    });

    // ── pilot ─────────────────────────────────────────────────────────────────────────────────
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'setup',
                player1: {
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'echo-base',
                    deck: ['alliance-xwing', 'alliance-xwing', 'alliance-xwing',
                        'academy-graduate', 'academy-graduate', 'academy-graduate',
                        'battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                        'clan-wren-rescuer', 'clan-wren-rescuer', ...REBEL],
                },
                player2: {
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    base: 'security-complex',
                    deck: ['vanquish', 'vanquish', 'vanquish',
                        'cell-block-guard', 'cell-block-guard', 'cell-block-guard', 'cell-block-guard',
                        'death-star-stormtrooper', ...VILLAIN, ...VILLAIN],
                },
            });
        });

        it('pilot: a unit flown onto a vehicle as an upgrade, then the vehicle Vanquished', function () {
            const { context } = contextRef;
            const keep: Keep = { p1: ['alliance-xwing', 'academy-graduate'], p2: ['vanquish'] };
            runSetup(context, 'swu-pgn-vector-pilot', keep);
            const p1 = context.player1;
            const p2 = context.player2;

            const takeTurn = (p: any): void => {
                if (p === p1) {
                    const vehicles = arenaUnits(p1).filter((u) => u.zoneName === 'spaceArena' && u.upgrades.length === 0);
                    const pilot = vehicles.length > 0 ? playable(p1, 'academy-graduate') : undefined;
                    if (pilot) {
                        p1.clickCard(pilot);
                        const piloting = (p1.currentButtons ?? []).find((b: string) => (/Piloting/).test(b));
                        if (piloting) {
                            p1.clickPrompt(piloting);
                        }
                        settle(p1, vehicles);
                        return;
                    }
                    const card = playable(p1, 'alliance-xwing', 'battlefield-marine', 'clan-wren-rescuer');
                    if (card) {
                        p1.clickCard(card);
                        settle(p1, arenaUnits(p1));
                        return;
                    }
                    if (attackBase(p1, context.p2Base)) {
                        return;
                    }
                    p1.passAction();
                    return;
                }
                const piloted = arenaUnits(p1).filter((u) => u.upgrades.length > 0);
                let card = piloted.length > 0 ? playable(p2, 'vanquish') : undefined;
                card = card ?? playable(p2, 'cell-block-guard', 'death-star-stormtrooper');
                if (card) {
                    p2.clickCard(card);
                    settle(p2, piloted);
                    return;
                }
                // P2 never attacks here: five 1-cost Stormtroopers swinging every round razed
                // the base by round 3, before the removal spells had anything to remove.
                p2.passAction();
            };

            const doc = vectorGate('pilot', runRounds(context, 4, keep, takeTurn));

            const pilotPlays = byType(doc, 'PLAY_UPGRADE').filter((e) => e.target);
            expect(pilotPlays.length).withContext('a pilot was played onto a vehicle')
                .toBeGreaterThan(0);
            const flights = byType(doc, 'MOVE').filter((e) => e.kind === 'upgrade' && e.to === 'space');
            expect(flights.length).toBeGreaterThan(0);
            expect(flights.every((e) => e.attachedTo)).toBe(true);
            const defeated = new Set(byType(doc, 'DEFEAT').map((e) => e.card));
            expect(pilotPlays.some((e) => defeated.has(e.target))).withContext('a piloted vehicle was defeated')
                .toBe(true);
            expect(doc.cards?.find((c) => c.id === pilotPlays[0].card.replace(/:\d+$/, ''))?.kind).toBe('unit');
        });
    });

    // ── capture ───────────────────────────────────────────────────────────────────────────────
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'setup',
                player1: {
                    leader: 'leia-organa#alliance-general',
                    base: 'echo-base',
                    deck: ['take-captive', 'take-captive', 'take-captive',
                        'battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                        'battlefield-marine', ...REBEL, ...REBEL],
                },
                player2: {
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    base: 'kestro-city',
                    deck: ['open-fire', 'open-fire', 'open-fire',
                        'cell-block-guard', 'cell-block-guard', 'cell-block-guard', 'cell-block-guard',
                        'death-star-stormtrooper', ...VILLAIN, ...VILLAIN],
                },
            });
        });

        it('capture: a unit taken captive, and rescued when its captor is defeated', function () {
            const { context } = contextRef;
            const keep: Keep = { p1: ['take-captive', 'battlefield-marine'], p2: ['open-fire', 'death-star-stormtrooper'] };
            runSetup(context, 'swu-pgn-vector-capture', keep);
            const p1 = context.player1;
            const p2 = context.player2;

            const takeTurn = (p: any): void => {
                if (p === p1) {
                    const mine = arenaUnits(p1).filter((u) => u.zoneName === 'groundArena');
                    const theirs = arenaUnits(p2).filter((u) => u.zoneName === 'groundArena');
                    const captive = mine.length > 0 && theirs.length > 0 ? playable(p1, 'take-captive') : undefined;
                    if (captive) {
                        p1.clickCard(captive);
                        settle(p1, [...mine, ...theirs]);
                        return;
                    }
                    const card = playable(p1, 'battlefield-marine', 'alliance-xwing');
                    if (card) {
                        p1.clickCard(card);
                        settle(p1);
                        return;
                    }
                    if (attackBase(p1, context.p2Base)) {
                        return;
                    }
                    p1.passAction();
                    return;
                }
                const captors = arenaUnits(p1).filter((u) => u.capturedUnits?.length > 0);
                let card = captors.length > 0 ? playable(p2, 'open-fire') : undefined;
                card = card ?? playable(p2, 'death-star-stormtrooper', 'cell-block-guard');
                if (card) {
                    p2.clickCard(card);
                    settle(p2, captors);
                    return;
                }
                if (attackBase(p2, context.p1Base)) {
                    return;
                }
                p2.passAction();
            };

            const doc = vectorGate('capture', runRounds(context, 3, keep, takeTurn));

            const captures = byType(doc, 'CAPTURE');
            expect(captures.length).withContext('a unit was captured')
                .toBeGreaterThan(0);
            expect(captures.every((e) => e.by && e.p === 1)).toBe(true);
            expect(byType(doc, 'RESCUE').length).withContext('a captive was rescued')
                .toBeGreaterThan(0);
            expect(byType(doc, 'MOVE').some((e) => e.to === 'capture')).toBe(true);
            expect(byType(doc, 'MOVE').some((e) => e.from === 'capture')).toBe(true);
        });
    });

    // ── arrest ────────────────────────────────────────────────────────────────────────────────
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'setup',
                player1: {
                    leader: 'boba-fett#collecting-the-bounty',
                    base: 'jabbas-palace',
                    deck: ['arrest', 'arrest', 'arrest', 'arrest',
                        'peridea-bandit', 'peridea-bandit', 'peridea-bandit', 'peridea-bandit', ...VILLAIN, ...VILLAIN],
                },
                player2: {
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'great-grass-plains',
                    deck: ['battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine', ...REBEL, ...REBEL, ...REBEL],
                },
            });
        });

        it('arrest: a base captures a unit, holds it in baseCaptured, and loses it at the regroup', function () {
            const { context } = contextRef;
            const keep: Keep = { p1: ['arrest', 'peridea-bandit'], p2: ['battlefield-marine'] };
            runSetup(context, 'swu-pgn-vector-arrest', keep);
            const p1 = context.player1;
            const p2 = context.player2;

            const takeTurn = (p: any): void => {
                if (p === p1) {
                    const theirs = arenaUnits(p2).filter((u) => !u.isLeader?.());
                    const arrest = theirs.length > 0 && context.p1Base.capturedUnits.length === 0 ? playable(p1, 'arrest') : undefined;
                    if (arrest) {
                        p1.clickCard(arrest);
                        settle(p1, theirs);
                        return;
                    }
                    const card = playable(p1, 'peridea-bandit', 'death-star-stormtrooper');
                    if (card) {
                        p1.clickCard(card);
                        settle(p1);
                        return;
                    }
                    if (attackBase(p1, context.p2Base)) {
                        return;
                    }
                    p1.passAction();
                    return;
                }
                const card = playable(p2, 'battlefield-marine', 'alliance-xwing');
                if (card) {
                    p2.clickCard(card);
                    settle(p2);
                    return;
                }
                if (attackBase(p2, context.p1Base)) {
                    return;
                }
                p2.passAction();
            };

            const doc = vectorGate('arrest', runRounds(context, 3, keep, takeTurn));

            const captures = byType(doc, 'CAPTURE');
            expect(captures.length).withContext('a base captured a unit')
                .toBeGreaterThan(0);
            expect(captures.every((e) => e.by === 'base@1' && e.p === 1)).toBe(true);
            // While held, the base -- not a unit, and not nowhere -- has it; the rescue releases it.
            for (const c of captures) {
                const held = stateAt(doc.events, c.seq);
                expect(held.players[1]?.baseCaptured).withContext(`${c.seq}: the base holds it`)
                    .toContain(c.card);
                expect(held.players[1]?.cards.some((u) => u.captured.includes(c.card))).toBeFalse();
            }
            expect(byType(doc, 'RESCUE').length).withContext('Arrest\'s captive was rescued')
                .toBe(captures.length);
            expect(fold(doc.events).players[1]?.baseCaptured).toEqual([]);
        });
    });

    // ── stolen-hauler ─────────────────────────────────────────────────────────────────────────
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'setup',
                player1: {
                    leader: 'han-solo#worth-the-risk',
                    base: 'jabbas-palace',
                    // Haulers are P1's only units, so Power of the Dark Side can only take one.
                    deck: ['stolen-athauler', 'stolen-athauler', 'stolen-athauler', 'stolen-athauler',
                        'stolen-athauler', 'stolen-athauler', ...REBEL, ...REBEL],
                },
                player2: {
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    base: 'security-complex',
                    deck: ['power-of-the-dark-side', 'power-of-the-dark-side', 'power-of-the-dark-side',
                        'power-of-the-dark-side', ...VILLAIN, ...VILLAIN],
                },
            });
        });

        it('stolen-hauler: a unit defeated into its owner\'s discard is played from there by the opponent', function () {
            const { context } = contextRef;
            const keep: Keep = { p1: ['stolen-athauler'], p2: ['power-of-the-dark-side'] };
            runSetup(context, 'swu-pgn-vector-stolen-hauler', keep);
            const p1 = context.player1;
            const p2 = context.player2;

            const takeTurn = (p: any): void => {
                if (p === p1) {
                    const hauler = playable(p1, 'stolen-athauler');
                    if (hauler) {
                        p1.clickCard(hauler);
                        settle(p1);
                        return;
                    }
                    if (attackBase(p1, context.p2Base)) {
                        return;
                    }
                    p1.passAction();
                    return;
                }
                // The opponent's copy, out of P1's discard: free for the rest of this phase.
                const stolen = (p2.currentActionTargets ?? []).find((c: any) => c.zoneName === 'discard' && c.internalName === 'stolen-athauler');
                if (stolen) {
                    p2.clickCard(stolen);
                    settle(p2);
                    return;
                }
                const theirs = arenaUnits(p1).filter((u) => u.internalName === 'stolen-athauler');
                const power = theirs.length > 0 ? playable(p2, 'power-of-the-dark-side') : undefined;
                if (power) {
                    p2.clickCard(power);
                    settle(p2);
                    settle(p1, theirs);
                    return;
                }
                if (attackBase(p2, context.p1Base)) {
                    return;
                }
                p2.passAction();
            };

            const doc = vectorGate('stolen-hauler', runRounds(context, 3, keep, takeTurn));

            const owners = new Map(doc.decks.map((d) => [d.p, new Set(d.deck.map(([id]) => id))]));
            const stolen = byType(doc, 'MOVE').filter((e) => e.from === 'discard' && e.p === 2 && owners.get(1)?.has(e.card.split(':')[0]));
            expect(stolen.length).withContext('P2 played a P1 card out of P1\'s discard')
                .toBeGreaterThan(0);
            for (const m of stolen) {
                const after = stateAt(doc.events, m.seq);
                expect(after.players[1]?.discard).withContext(`${m.seq}: left its owner's pile`)
                    .not.toContain(m.card);
                expect(after.players[2]?.cards.some((c) => c.id === m.card)).withContext(`${m.seq}: in P2's arena`)
                    .toBeTrue();
            }
        });
    });

    // ── death-star ────────────────────────────────────────────────────────────────────────────
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'setup',
                player1: {
                    leader: 'grand-moff-tarkin#tyrant-of-the-outer-rim',
                    base: 'dune-sea',
                    deck: ['venomous-wyyyshokk', 'venomous-wyyyshokk', 'venomous-wyyyshokk', 'venomous-wyyyshokk',
                        'clone-x-assassin', 'clone-x-assassin', 'clone-x-assassin', 'clone-x-assassin',
                        'occupation-officer', 'occupation-officer', 'occupation-officer', 'occupation-officer',
                        'occupation-officer', 'occupation-officer', ...VILLAIN, ...VILLAIN],
                },
                player2: {
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'great-grass-plains',
                    deck: [...REBEL, ...REBEL, ...REBEL, ...REBEL, ...REBEL, 'battlefield-marine', 'battlefield-marine'],
                },
            });
        });

        it('death-star: Tarkin deploys as The Death Star and defeats a base that still has HP', function () {
            const { context } = contextRef;
            const keep: Keep = { p1: ['venomous-wyyyshokk', 'clone-x-assassin', 'occupation-officer', 'death-star-stormtrooper'], p2: [] };
            runSetup(context, 'swu-pgn-vector-death-star', keep);
            const game: any = context.game;
            const p1 = context.player1;
            const p2 = context.player2;
            const remaining = () => context.p2Base.remainingHp as number;

            /** Decline any optional trigger (Occupation Officer's Weakness has no enemy to land on). */
            const decline = (p: any): boolean => {
                if ((p.currentButtons ?? []).includes('Pass') && (p.currentButtons ?? []).includes('Trigger')) {
                    p.clickPrompt('Pass');
                    return true;
                }
                return false;
            };
            const takeTurn = (p: any): void => {
                if (decline(p)) {
                    return;
                }
                if (p === p2) {
                    // P2 never plays a unit: nothing stands between P1 and the base, and nothing
                    // races Tarkin to it.
                    p2.passAction();
                    return;
                }
                // Wear the base down to 10 or less -- never to 0: the Death Star finishes it.
                const attacker = (p1.currentActionTargets ?? []).find((c: any) =>
                    c.isUnit?.() && c.isInPlay?.() && !c.exhausted && remaining() > 10 && remaining() - c.getPower() > 0);
                if (attacker) {
                    p1.clickCard(attacker);
                    settle(p1, [context.p2Base]);
                    return;
                }
                const card = playable(p1, 'venomous-wyyyshokk', 'occupation-officer', 'clone-x-assassin', 'death-star-stormtrooper');
                if (card) {
                    p1.clickCard(card);
                    settle(p1, []);
                    return;
                }
                p1.passAction();
            };

            // Seven rounds build the nine resources the Epic Action asks for.
            for (let round = 1; round <= 7; round++) {
                let guard = 0;
                while (game.currentPhase === 'action' && guard++ < 60) {
                    takeTurn(p1.canAct ? p1 : p2);
                }
                resourceCards(p1, p1.hand.length > 0 ? 1 : 0, keep.p1);
                resourceCards(p2, p2.hand.length > 0 ? 1 : 0, keep.p2);
            }
            expect(p1.player.resources.length).withContext('nine resources for the Epic Action')
                .toBe(9);
            expect(remaining()).withContext('the base is in Tarkin\'s range')
                .toBeLessThanOrEqual(10);

            // Round 8: deploy, play the round out, and let the Death Star fire at regroup.
            p1.clickCard(context.grandMoffTarkin);
            p1.clickPrompt('Deploy Grand Moff Tarkin');
            let guard = 0;
            while (game.currentPhase === 'action' && guard++ < 60) {
                takeTurn(p1.canAct ? p1 : p2);
            }
            p1.clickCard(context.p2Base);
            expect(game.isEnded).toBe(true);
            context.ignoreUnresolvedActionPhasePrompts = true;

            const doc = vectorGate('death-star', game.getCachedSwuPgn());

            const tarkin = doc.header.p1Leader;
            expect(doc.cards?.find((c) => c.id === tarkin)?.backSideName).toBe('The Death Star, Icon of Tyranny');
            expect(byType(doc, 'DEPLOY_LEADER').some((e) => e.card === tarkin && e.zone === 'space' && !(/^R\d+\.A\.\d+$/).test(e.seq)))
                .withContext('the deploy is a sub-step of its Epic Action')
                .toBe(true);
            const defeat = byType(doc, 'DEFEAT').find((e) => e.card === 'base@2');
            expect(defeat).toEqual(jasmine.objectContaining({ reason: 'ability', defeatedBy: tarkin }));
            expect(fold(doc.events).players[2]?.baseHp).withContext('the base fell with HP left')
                .toBeGreaterThan(0);
            expect(fold(doc.events).players[2]?.baseDefeated).toBe(true);
            expect(byType(doc, 'GAME_END')[0]).toEqual(jasmine.objectContaining({ winner: 1 }));
        });
    });

    // ── homeworlds ────────────────────────────────────────────────────────────────────────────
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'setup',
                player1: {
                    leader: 'tarfful#fighting-from-the-shadowlands',
                    base: 'tusken-camp',
                    deck: ['beast-lair', 'beast-lair', 'landing-pad', 'landing-pad', 'verdant-fortress', 'verdant-fortress',
                        'migrate', 'migrate', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine', ...REBEL],
                },
                player2: {
                    leader: 'doctor-hemlock#emotion-has-no-place-here',
                    base: 'dune-sea',
                    deck: ['torrent', 'torrent', 'torrent', 'torrent', 'carbonite-chamber', 'carbonite-chamber',
                        'venomous-wyyyshokk', 'venomous-wyyyshokk', 'clone-x-assassin', 'clone-x-assassin',
                        'occupation-officer', 'occupation-officer', 'occupation-officer', 'occupation-officer'],
                },
            });
        });

        it('homeworlds: Fortify upgrades on both bases, Beast tokens, and Weakness tokens', function () {
            const { context } = contextRef;
            const keep: Keep = { p1: ['beast-lair', 'landing-pad', 'verdant-fortress', 'migrate'], p2: ['torrent', 'carbonite-chamber'] };
            runSetup(context, 'swu-pgn-vector-homeworlds', keep);
            const p1 = context.player1;
            const p2 = context.player2;
            const onBase = (p: any, name: string) => p.player.baseZone.upgrades.some((u: any) => u.internalName === name);
            const beasts = () => arenaUnits(p1).filter((u) => u.internalName === 'beast');

            /** Answer an optional "you may" trigger (Beast Lair's discard): yes, paying with a non-keeper. */
            const trigger = (p: any, keepers: string[]): boolean => {
                if (!(p.currentButtons ?? []).includes('Trigger')) {
                    return false;
                }
                p.clickPrompt('Trigger');
                const offered: any[] = p.currentActionTargets ?? [];
                const discard = offered.find((c) => !keepers.includes(c.internalName)) ?? offered[0];
                if (discard) {
                    p.clickCard(discard);
                }
                return true;
            };

            const takeTurn = (p: any): void => {
                if (p === p1) {
                    if (trigger(p1, keep.p1)) {
                        return;
                    }
                    // Build the base first -- Beast Lair, then the two static Fortify upgrades --
                    // then make Beasts, then bodies; attack with whatever is ready.
                    let card = !onBase(p1, 'beast-lair') ? playable(p1, 'beast-lair') : undefined;
                    card = card ?? (!onBase(p1, 'landing-pad') ? playable(p1, 'landing-pad') : undefined);
                    card = card ?? (!onBase(p1, 'verdant-fortress') ? playable(p1, 'verdant-fortress') : undefined);
                    card = card ?? playable(p1, 'migrate', 'battlefield-marine', 'alliance-xwing');
                    if (card) {
                        p1.clickCard(card);
                        settle(p1, [context.p1Base]);
                        return;
                    }
                    if (attackBase(p1, context.p2Base)) {
                        return;
                    }
                    p1.passAction();
                    return;
                }
                if (trigger(p2, keep.p2)) {
                    return;
                }
                // Use Carbonite Chamber off the base once a Beast is there to freeze; Weakness on
                // the Beasts; Fortify the base; then bodies. P2 does not attack, so P1's board grows.
                const chamber = (p2.currentActionTargets ?? []).find((c: any) => c.internalName === 'carbonite-chamber' && c.zoneName === 'base');
                if (chamber && beasts().length > 0) {
                    p2.clickCard(chamber);
                    settle(p2, beasts());
                    return;
                }
                let card = beasts().length > 0 ? playable(p2, 'torrent') : undefined;
                card = card ?? (!onBase(p2, 'carbonite-chamber') ? playable(p2, 'carbonite-chamber') : undefined);
                card = card ?? playable(p2, 'venomous-wyyyshokk', 'clone-x-assassin', 'occupation-officer');
                if (card) {
                    p2.clickCard(card);
                    settle(p2, [context.p2Base, ...beasts()]);
                    return;
                }
                p2.passAction();
            };

            const doc = vectorGate('homeworlds', runRounds(context, 5, keep, takeTurn));

            // The situations this vector exists for actually happened.
            const fortified = byType(doc, 'PLAY_UPGRADE').filter((e) => e.zone === 'base');
            expect(fortified.some((e) => e.p === 1 && e.target === 'base@1')).withContext('P1 Fortified its base')
                .toBe(true);
            expect(fortified.some((e) => e.p === 2 && e.target === 'base@2')).withContext('P2 Fortified its base')
                .toBe(true);
            expect(byType(doc, 'MOVE').filter((e) => e.to === 'base' && e.kind === 'upgrade')
                .every((e) => (/^base@[12]$/).test(e.attachedTo)))
                .withContext('every base attachment names its base')
                .toBe(true);
            const keyframes = doc.events.filter((e: any) => e.keyframe);
            expect(keyframes.some((e: any) => e.keyframe.players[1].baseUpgrades.length >= 2)).withContext('a keyframe holds a Fortified base')
                .toBe(true);
            expect(byType(doc, 'MOVE').some((e) => e.from === 'base' && e.kind === 'upgrade')).withContext('a base upgrade left its base')
                .toBe(true);
            expect(byType(doc, 'ABILITY_ACTIVATE').some((e) => e.card === 'base@1' && e.grantedBy)).withContext('a base used a granted ability')
                .toBe(true);
            expect(byType(doc, 'CREATE_TOKEN').some((e) => e.token.startsWith('TOKEN:beast#'))).withContext('a Beast was created')
                .toBe(true);
            expect(byType(doc, 'STATUS_TOKEN').some((e) => e.token === 'weakness' && e.count > 0 && e.card.startsWith('TOKEN:beast#')))
                .withContext('a Beast was given a Weakness token')
                .toBe(true);
        });
    });

    // ── effects ───────────────────────────────────────────────────────────────────────────────
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'setup',
                player1: {
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    base: 'kestro-city',
                    deck: ['wolffe#suspicious-veteran', 'wolffe#suspicious-veteran',
                        'rallying-cry', 'rallying-cry', 'rallying-cry',
                        'force-lightning', 'force-lightning', 'give-in-to-your-anger', 'give-in-to-your-anger',
                        ...VILLAIN, ...VILLAIN, ...REBEL],
                },
                player2: {
                    leader: 'leia-organa#alliance-general',
                    base: 'echo-base',
                    deck: ['battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                        'battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine', ...REBEL, ...REBEL],
                },
            });
        });

        it('effects: lasting effects on bases and units, one partly ended by a unit leaving play, a blank and an until', function () {
            const { context } = contextRef;
            // P1 resources its X-Wings, which it never plays.
            const keep: Keep = { p1: ['wolffe#suspicious-veteran', 'rallying-cry', 'force-lightning', 'give-in-to-your-anger', 'death-star-stormtrooper'], p2: ['battlefield-marine'] };
            runSetup(context, 'swu-pgn-vector-effects', keep);
            const game: any = context.game;
            const p1 = context.player1;
            const p2 = context.player2;
            const ground = (p: any) => arenaUnits(p).filter((u) => u.zoneName === 'groundArena');
            const played = new Set<string>();
            const once = (name: string) => !played.has(`${game.roundNumber}:${name}`);
            const play = (p: any, card: any, answers: Answers = {}) => {
                played.add(`${game.roundNumber}:${card.internalName}`);
                p.clickCard(card);
                answerAll(context, answers);
            };

            const takeTurn = (p: any): void => {
                if (p === p1) {
                    const theirs = ground(p2);
                    // Raided by Rallying Cry, a Stormtrooper trades with an enemy unit: it leaves
                    // play while the effect still holds the others.
                    if (!once('rallying-cry') && once('trade') && theirs.length > 0) {
                        const trooper = (p1.currentActionTargets ?? []).find((c: any) => c.internalName === 'death-star-stormtrooper' && c.isInPlay?.());
                        if (trooper) {
                            played.add(`${game.roundNumber}:trade`);
                            p1.clickCard(trooper);
                            answerAll(context, { prefer: theirs });
                            return;
                        }
                    }
                    let card = ground(p1).length >= 2 && theirs.length > 0 && once('rallying-cry') ? playable(p1, 'rallying-cry') : undefined;
                    card = card ?? (!ground(p1).some((u) => u.internalName === 'wolffe#suspicious-veteran') ? playable(p1, 'wolffe#suspicious-veteran') : undefined);
                    card = card ?? (theirs.length > 0 && once('force-lightning') ? playable(p1, 'force-lightning') : undefined);
                    card = card ?? (theirs.length > 0 && once('give-in-to-your-anger') ? playable(p1, 'give-in-to-your-anger') : undefined);
                    card = card ?? playable(p1, 'death-star-stormtrooper');
                    if (card) {
                        play(p1, card, { prefer: theirs });
                        return;
                    }
                    p1.passAction();
                    return;
                }
                const card = playable(p2, 'battlefield-marine', 'alliance-xwing');
                if (card) {
                    play(p2, card);
                    return;
                }
                // P2 attacks only P1's units, so both bases outlast the game.
                const attacker = (p2.currentActionTargets ?? []).find((c: any) => c.isUnit?.() && c.isInPlay?.() && c.zoneName === 'groundArena');
                if (attacker && ground(p1).length > 0) {
                    p2.clickCard(attacker);
                    answerAll(context, { prefer: ground(p1) });
                    return;
                }
                p2.passAction();
            };

            const doc = vectorGate('effects', playRounds(context, 4, keep, takeTurn));

            const starts = byType(doc, 'EFFECT_START');
            const ends = byType(doc, 'EFFECT_END');
            expect(starts.some((e) => (e.targets ?? []).includes('base@1') && (e.targets ?? []).includes('base@2') && e.duration === 'phase'))
                .withContext('Wolffe\'s effect on both bases for the phase')
                .toBe(true);
            expect(ends.some((e) => e.targets && e.reason === 'targetLeft')).withContext('a partial EFFECT_END')
                .toBe(true);
            expect(starts.some((e) => e.duration === 'until' && typeof e.untilText === 'string')).withContext('an until effect')
                .toBe(true);
            expect(ends.some((e) => e.reason === 'expired' && !e.targets)).withContext('an effect that expired')
                .toBe(true);
            expect(byType(doc, 'STATS').some((e) => e.blank === true)).withContext('a blanked unit')
                .toBe(true);
            expect(doc.events.some((e: any) => e.t === 'DAMAGE' && e.simul)).withContext('combat damage both ways at once')
                .toBe(true);
            expect(fold(doc.events).effects).toBeDefined();
        });
    });

    // ── visibility ────────────────────────────────────────────────────────────────────────────
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'setup',
                player1: {
                    leader: 'grand-admiral-thrawn#how-unfortunate',
                    base: 'kestro-city',
                    deck: ['wartime-trade-official', 'wartime-trade-official', 'wartime-trade-official', 'wartime-trade-official',
                        'regional-governor', 'regional-governor', 'remote-scout', 'remote-scout',
                        'every-day-more-lies', 'every-day-more-lies', 'viper-probe-droid', 'viper-probe-droid',
                        'inferno-four#unforgetting', 'inferno-four#unforgetting', 'foundling', 'foundling', ...REBEL],
                },
                player2: {
                    leader: 'leia-organa#alliance-general',
                    base: 'echo-base',
                    deck: ['battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                        'battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine', ...REBEL, ...REBEL],
                },
            });
        });

        it('visibility: looks, a search, a name, blind discards, and a When Defeated used again by the leader', function () {
            const { context } = contextRef;
            const keep: Keep = {
                p1: ['wartime-trade-official', 'regional-governor', 'remote-scout', 'every-day-more-lies', 'viper-probe-droid', 'inferno-four#unforgetting', 'foundling'],
                p2: ['battlefield-marine'],
            };
            runSetup(context, 'swu-pgn-vector-visibility', keep);
            const game: any = context.game;
            const p1 = context.player1;
            const p2 = context.player2;
            const ground = (p: any) => arenaUnits(p).filter((u) => u.zoneName === 'groundArena');
            const played = new Set<string>();
            const once = (name: string) => !played.has(name);
            const play = (p: any, card: any, answers: Answers = {}) => {
                played.add(card.internalName);
                p.clickCard(card);
                answerAll(context, answers);
            };

            const takeTurn = (p: any): void => {
                if (p === p1) {
                    const theirs = ground(p2);
                    // A Wartime Trade Official attacks into a Battlefield Marine and dies: its When
                    // Defeated, then Thrawn's "use that ability again".
                    const official = (p1.currentActionTargets ?? []).find((c: any) => c.internalName === 'wartime-trade-official' && c.isInPlay?.());
                    if (official && theirs.length > 0 && once(`trade-${game.roundNumber}`)) {
                        played.add(`trade-${game.roundNumber}`);
                        p1.clickCard(official);
                        answerAll(context, { prefer: theirs });
                        return;
                    }
                    let card = once('regional-governor') ? playable(p1, 'regional-governor') : undefined;
                    card = card ?? (once('every-day-more-lies') && p2.hand.length > 0 ? playable(p1, 'every-day-more-lies') : undefined);
                    card = card ?? (once('viper-probe-droid') && p2.hand.length > 0 ? playable(p1, 'viper-probe-droid') : undefined);
                    card = card ?? (once('inferno-four#unforgetting') ? playable(p1, 'inferno-four#unforgetting') : undefined);
                    card = card ?? (once('remote-scout') ? playable(p1, 'remote-scout') : undefined);
                    card = card ?? playable(p1, 'wartime-trade-official');
                    if (card) {
                        play(p1, card, { name: 'Battlefield Marine', prefer: theirs });
                        return;
                    }
                    p1.passAction();
                    return;
                }
                // P2 only builds a board for P1 to attack into.
                const card = playable(p2, 'battlefield-marine', 'alliance-xwing');
                if (card) {
                    play(p2, card);
                    return;
                }
                p2.passAction();
            };

            const doc = vectorGate('visibility', playRounds(context, 5, keep, takeTurn));

            expect(byType(doc, 'LOOK').some((e) => e.zone === 'hand' && e.owner === 2)).withContext('a look at the opponent\'s hand')
                .toBe(true);
            expect(byType(doc, 'LOOK').some((e) => e.zone === 'deck' && e.owner === 1)).withContext('a look at the top of the deck')
                .toBe(true);
            expect(byType(doc, 'SEARCH').some((e) => e.owner === 1 && (e.seen ?? []).length > 0)).withContext('a search and the cards it saw')
                .toBe(true);
            expect(byType(doc, 'NAME').length).withContext('a card named')
                .toBeGreaterThan(0);
            const blind = byType(doc, 'CHOICE').filter((e) => e.blind);
            expect(new Set(blind.map((e) => e.p)).size).withContext('both seats chose blind')
                .toBe(2);
            expect(doc.events.some((e: any) => e.t === 'DISCARD' && e.simul)).withContext('the discards are one simultaneous group')
                .toBe(true);
            expect(byType(doc, 'ABILITY_ACTIVATE').some((e) => e.usedBy === doc.header.p1Leader)).withContext('Thrawn used a When Defeated again')
                .toBe(true);
        });
    });

    // ── control ───────────────────────────────────────────────────────────────────────────────
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'setup',
                player1: {
                    leader: 'grand-moff-tarkin#tyrant-of-the-outer-rim',
                    base: 'echo-base',
                    deck: ['gar-saxon#coveting-power', 'gar-saxon#coveting-power', 'foundling', 'foundling', 'foundling',
                        'evidence-of-the-crime', 'evidence-of-the-crime', 'clone', 'clone', 'traitorous', 'traitorous',
                        'arquitens-assault-cruiser', 'arquitens-assault-cruiser', ...REBEL, ...REBEL, ...REBEL],
                },
                player2: {
                    leader: 'leia-organa#alliance-general',
                    base: 'echo-base',
                    deck: ['battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                        'battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                        'academy-training', 'academy-training', 'academy-training', 'academy-training', ...REBEL, ...REBEL],
                },
            });
        });

        it('control: an upgrade and a unit taken, a copy, a gained trait, a limited ability, and an enemy unit made a resource', function () {
            const { context } = contextRef;
            // P1 resources its X-Wings, which it never plays.
            const keep: Keep = {
                p1: ['gar-saxon#coveting-power', 'foundling', 'evidence-of-the-crime', 'clone', 'traitorous', 'arquitens-assault-cruiser'],
                p2: ['battlefield-marine', 'academy-training'],
            };
            runSetup(context, 'swu-pgn-vector-control-b', keep);
            const p1 = context.player1;
            const p2 = context.player2;
            const units = (p: any) => arenaUnits(p).filter((u) => !u.isLeader?.());
            const upgraded = () => units(p2).filter((u) => u.upgrades.some((x: any) => x.internalName === 'academy-training'));
            const gar = () => units(p1).find((u) => u.internalName === 'gar-saxon#coveting-power');
            const played = new Set<string>();
            const once = (name: string) => !played.has(`${context.game.roundNumber}:${name}`);
            const play = (p: any, card: any, answers: Answers = {}) => {
                played.add(`${context.game.roundNumber}:${card.internalName}`);
                p.clickCard(card);
                answerAll(context, answers);
            };

            const takeTurn = (p: any): void => {
                if (p === p1) {
                    const theirs = units(p2).filter((u) => u.zoneName === 'groundArena');
                    // Arquitens Ambushes a unit and puts it into play as P1's resource.
                    let card = theirs.length > 0 ? playable(p1, 'arquitens-assault-cruiser') : undefined;
                    if (card) {
                        play(p1, card, { prefer: theirs });
                        return;
                    }
                    card = units(p1).length + theirs.length > 0 ? playable(p1, 'clone') : undefined;
                    card = card ?? (theirs.some((u) => u.upgrades.length === 0) ? playable(p1, 'traitorous') : undefined);
                    card = card ?? (upgraded().length > 0 && units(p1).length > 0 ? playable(p1, 'evidence-of-the-crime') : undefined);
                    card = card ?? (gar() ? undefined : playable(p1, 'gar-saxon#coveting-power'));
                    card = card ?? (units(p1).length > 0 && once('foundling') ? playable(p1, 'foundling') : undefined);
                    if (card) {
                        const host = gar();
                        const mine = [...(host ? [host] : []), ...units(p1)];
                        const prefer = card.internalName === 'traitorous' ? theirs.filter((u) => u.upgrades.length === 0)
                            : card.internalName === 'evidence-of-the-crime' ? [...upgraded().flatMap((u) => u.upgrades), ...mine]
                                : card.internalName === 'clone' ? theirs
                                    : mine;
                        play(p1, card, { prefer });
                        return;
                    }
                    p1.passAction();
                    return;
                }
                const bare = units(p2).filter((u) => u.zoneName === 'groundArena' && u.upgrades.length === 0);
                let card = bare.length > 0 && upgraded().length === 0 ? playable(p2, 'academy-training') : undefined;
                card = card ?? playable(p2, 'battlefield-marine', 'alliance-xwing');
                if (card) {
                    play(p2, card, { prefer: bare });
                    return;
                }
                p2.passAction();
            };

            const doc = vectorGate('control', playRounds(context, 7, keep, takeTurn));

            const kindOf = (id: string) => doc.cards?.find((c) => c.id === id.replace(/:\d+$/, ''))?.kind;
            expect(byType(doc, 'TAKE_CONTROL').some((e) => kindOf(e.card) === 'upgrade')).withContext('an upgrade changed control')
                .toBe(true);
            expect(byType(doc, 'STATS').some((e) => e.copyOf)).withContext('a copy')
                .toBe(true);
            expect(byType(doc, 'STATS').some((e) => (e.traits ?? []).includes('mandalorian') && e.card !== doc.cards?.find((c) => c.name.startsWith('Gar Saxon'))?.id))
                .withContext('a gained trait')
                .toBe(true);
            expect(byType(doc, 'ABILITY_ACTIVATE').some((e) => e.limit)).withContext('a limited ability')
                .toBe(true);
            const keyframes = doc.events.filter((e: any) => e.keyframe);
            expect(keyframes.some((e: any) => e.keyframe.players[1].foreignResources.length > 0)).withContext('a resource P2 owns in P1\'s row')
                .toBe(true);
            expect(keyframes.some((e: any) => e.keyframe.players[1].cards.some((c: any) => c.owner === 2))).withContext('a unit P1 controls and P2 owns')
                .toBe(true);
        });
    });
});
