import { vectorGate } from './swuPgnVectorGate';

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
});
