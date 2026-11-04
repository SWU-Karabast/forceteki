import { PhaseName } from '../../../server/game/core/Constants';
import type { PlayerInteractionWrapper } from '../../helpers/PlayerInteractionWrapper';

/**
 * Deterministic whole games for the SWU-PGN writer: each starts at a natural setup phase (initiative, mulligan,
 * resourcing), plays 3 to 7 rounds on a fixed seed, and ends in a concession. They are the writer's long-board spec
 * (`ScriptedGames.spec.ts`) and workload A of the CPU benchmark (`scripts/swupgn-benchmark.js`).
 *
 * Each game is driven adaptively, every turn choosing from what the engine says is playable, and each is built around
 * one thing the writer has to get right; `playScriptedGame` fails if that thing never happened, so a card-data change
 * that changes the story fails loudly instead of silently playing a different game.
 *
 *   organic     plays, attacks and regroups on plain decks, the starting player taking a mulligan
 *   upgrades    a printed upgrade, Experience, Advantage and Shield tokens, and hosts defeated carrying them
 *   pilot       a pilot flown onto a vehicle as an upgrade, and the vehicle then Vanquished
 *   capture     a unit captured with Take Captive, and rescued when its captor is defeated
 *   arrest      a unit captured by a base (Arrest), and rescued at the regroup
 *   effects     lasting effects on bases and units, one partly ended by a unit leaving play, a blank
 *   visibility  looks, a search, a named card, blind discards, a When Defeated used again, a limited use reset
 *   control     an upgrade and a unit taken, a copy, a gained trait, an enemy unit made a resource
 *
 * Ported from the drivers of the old branch's vector specs, without their recorder calls.
 */
export type ScriptedGameName = 'organic' | 'upgrades' | 'pilot' | 'capture' | 'arrest' | 'effects' | 'visibility' | 'control';

export const scriptedGameNames: readonly ScriptedGameName[] = ['organic', 'upgrades', 'pilot', 'capture', 'arrest', 'effects', 'visibility', 'control'];

/**
 * A card the drivers handle. The harness's prompt lists are `Card[]`, but the drivers read the unit, upgrade and base
 * members that only a narrowed card has, choosing by what the engine offers rather than by type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DriverCard = any;

type Seat = PlayerInteractionWrapper;

interface IKeep {
    p1: string[];
    p2: string[];
}

interface IAnswers {

    /** Cards to prefer whenever cards are offered. */
    prefer?: DriverCard[];

    /** The list option to name, when a card asks for a name. */
    name?: string;
}

/** One scripted game: its board, its seed, how each turn is taken and how many rounds it plays. */
interface IScriptedGame {
    setup: SwuSetupTestOptions;
    seed: string;
    keep: IKeep;
    rounds: number;

    /** `settle` answers each action's own prompts (the turn's actor); `answerAll` answers whichever seat is prompted. */
    driver: 'settle' | 'answerAll';

    /** Plays the setup phase; the default takes initiative with P1, both keep, both resource two. */
    runSetup?: (context: SwuTestContext) => void;

    /** Called with each turn's acting seat; returns what it tracks, so the story can be checked at the end. */
    makeTurn: (context: SwuTestContext) => IScriptedTurn;
}

interface IScriptedTurn {
    takeTurn: (p: Seat) => void;

    /** What the game exists for, checked after the last round: each entry is a description and whether it happened. */
    story: () => [string, boolean][];
}

// Decks are built on-aspect for their leader and base, so the cards each game needs are affordable when the script
// reaches for them: a two-aspect penalty turns a 2-cost unit into a 6-cost one.
const villain = ['death-star-stormtrooper', 'death-star-stormtrooper', 'death-star-stormtrooper', 'death-star-stormtrooper'];
const rebel = ['alliance-xwing', 'alliance-xwing', 'alliance-xwing', 'alliance-xwing'];

const organicDeck = [
    'death-star-stormtrooper', 'death-star-stormtrooper', 'death-star-stormtrooper',
    'battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
    'alliance-xwing', 'alliance-xwing', 'alliance-xwing',
    'wampa', 'wampa', 'wampa',
    'atst', 'atst',
    'battlefield-marine', 'battlefield-marine', 'alliance-xwing', 'death-star-stormtrooper', 'wampa'
];

/** A card in `p`'s hand the engine currently lets them play, by internal name. */
function playable(p: Seat, ...names: string[]): DriverCard {
    const targets: DriverCard[] = p.currentActionTargets ?? [];
    for (const name of names) {
        const card = targets.find((c) => c.zoneName === 'hand' && c.internalName === name);
        if (card) {
            return card;
        }
    }
    return undefined;
}

function arenaUnits(p: Seat): DriverCard[] {
    return p.player.getArenaUnits();
}

function inAction(context: SwuTestContext): boolean {
    return context.game.currentPhase === PhaseName.Action;
}

/** Click the first of `preferred` that the prompt offers, else the first thing it offers. */
function pick(p: Seat, preferred: DriverCard[] = []): void {
    const offered: DriverCard[] = p.currentActionTargets ?? [];
    const choice = preferred.find((c) => offered.includes(c)) ?? offered[0];
    if (choice) {
        p.clickCard(choice);
    }
}

/**
 * Brings the acting seat's turn to a close: answers the prompts its action leaves behind until priority passes to the
 * opponent (or the phase ends). Targets go to `preferred` when offered.
 */
function settle(p: Seat, preferred: DriverCard[] = []): void {
    for (let i = 0; i < 8 && p.canAct && p.game.currentPhase === PhaseName.Action; i++) {
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

/** Attacks the opposing base with the first ready unit, if any. */
function attackBase(p: Seat, enemyBase: DriverCard): boolean {
    const attackers = (p.currentActionTargets ?? []).filter((c: DriverCard) => c.isUnit?.() && c.isInPlay?.());
    if (attackers.length === 0) {
        return false;
    }
    p.clickCard(attackers[0]);
    settle(p, [enemyBase]);
    return true;
}

/** Resources `n` cards from the prompt, filler first, so the game's own cards stay in hand. */
function resourceCards(p: Seat, n: number, keep: string[]): void {
    for (let i = 0; i < n; i++) {
        const offered: DriverCard[] = (p.currentActionTargets ?? []).filter((c: DriverCard) => !p.selectedCards.includes(c));
        const choice = offered.find((c) => !keep.includes(c.internalName)) ?? offered[0];
        if (choice) {
            p.clickCard(choice);
        }
    }
    p.clickDone();
}

/** Whether `p` has something to answer: any prompt but a "waiting for the opponent" one. */
function acting(p: Seat): boolean {
    return !(/^Waiting for opponent/i).test(p.currentPrompt().menuTitle ?? '');
}

/** The seat whose prompt the game is waiting on. */
function actor(context: SwuTestContext): Seat {
    const { player1, player2 } = context;
    if (acting(player1) && !acting(player2)) {
        return player1;
    }
    if (acting(player2) && !acting(player1)) {
        return player2;
    }
    return player1.canAct ? player1 : player2;
}

/**
 * Answers every prompt between an action and the next "Choose an action", whichever seat it is for: optional
 * triggers are taken, a name is picked from the list, cards looked at go back on top, a search takes the first card it
 * may, and other targets go to `prefer` when offered.
 */
function answerAll(context: SwuTestContext, answers: IAnswers = {}): void {
    const game = context.game;
    for (let i = 0; i < 40 && inAction(context) && !game.isEnded; i++) {
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
            const selectable = prompt.displayCards.find((c: DriverCard) => c.selectionState === 'selectable');
            if (selectable && !(p.selectedCards ?? []).some((c: DriverCard) => c.uuid === selectable.cardUuid)) {
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
        const offered: DriverCard[] = (p.currentActionTargets ?? []).filter((c: DriverCard) => !(p.selectedCards ?? []).includes(c));
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

/** Natural setup: P1 takes initiative, both keep, both resource two. */
function defaultSetup(keep: IKeep): (context: SwuTestContext) => void {
    return (context) => {
        context.selectInitiativePlayer(context.player1);
        context.player1.clickPrompt('Keep');
        context.player2.clickPrompt('Keep');
        resourceCards(context.player1, 2, keep.p1);
        resourceCards(context.player2, 2, keep.p2);
    };
}

/** Records, for the story check, situations that are only visible while they last. */
class Sightings {
    private readonly seen = new Set<string>();

    public note(what: string, happened: boolean): void {
        if (happened) {
            this.seen.add(what);
        }
    }

    public has(what: string): boolean {
        return this.seen.has(what);
    }
}

const games: Record<ScriptedGameName, IScriptedGame> = {
    organic: {
        setup: {
            phase: 'setup',
            player1: { deck: [...organicDeck] },
            player2: { deck: [...organicDeck] }
        },
        seed: 'swu-pgn-organic-game',
        keep: { p1: [], p2: [] },
        rounds: 4,
        driver: 'settle',
        runSetup: (context) => {
            context.selectInitiativePlayer(context.player1);
            context.player1.clickPrompt('Mulligan');
            context.player2.clickPrompt('Keep');
            for (const p of [context.player1, context.player2]) {
                p.clickAnyOfSelectableCards(2);
                p.clickDone();
            }
        },
        makeTurn: (context) => {
            const baseOf = (p: Seat) => (p === context.player1 ? context.p2Base : context.p1Base);
            let attacks = 0;
            return {
                // the most expensive playable unit, else an attack on the base with a ready unit, else pass
                takeTurn: (p) => {
                    const targets: DriverCard[] = p.currentActionTargets ?? [];
                    const units = targets.filter((c) => c.zoneName === 'hand' && c.isUnit?.())
                        .sort((a, b) => b.cost - a.cost);
                    if (units.length > 0) {
                        p.clickCard(units[0]);
                        return;
                    }
                    const attackers = targets.filter((c) => c.isUnit?.() && c.isInPlay?.());
                    if (attackers.length > 0) {
                        attacks++;
                        p.clickCard(attackers[0]);
                        p.clickCard(baseOf(p));
                        return;
                    }
                    p.passAction();
                },
                story: () => [['a base was attacked', attacks > 0]]
            };
        }
    },

    upgrades: {
        setup: {
            phase: 'setup',
            player1: {
                leader: 'luke-skywalker#faithful-friend',
                base: 'echo-base',
                deck: [
                    'zealous-soldier', 'zealous-soldier', 'zealous-soldier',
                    'clan-wren-rescuer', 'clan-wren-rescuer',
                    'ascension-cable', 'ascension-cable', 'ascension-cable',
                    'cloaked-starviper', 'cloaked-starviper',
                    'battlefield-marine', 'battlefield-marine', ...rebel
                ]
            },
            player2: {
                leader: 'darth-vader#dark-lord-of-the-sith',
                base: 'security-complex',
                // no Sentinels: P1's attacks must be free to go at the base, or its hosts die before the printed upgrade lands
                deck: ['open-fire', 'open-fire', 'open-fire', 'vanquish', 'vanquish',
                    'death-star-stormtrooper', 'death-star-stormtrooper', 'death-star-stormtrooper', ...villain, ...villain]
            }
        },
        seed: 'swu-pgn-vector-upgrades',
        keep: { p1: ['zealous-soldier', 'clan-wren-rescuer', 'ascension-cable', 'cloaked-starviper'], p2: ['open-fire', 'vanquish'] },
        rounds: 4,
        driver: 'settle',
        makeTurn: (context) => {
            const p1 = context.player1;
            const p2 = context.player2;
            const seen = new Sightings();
            const withMost = (units: DriverCard[]) => [...units].sort((a, b) => b.upgrades.length - a.upgrades.length)[0];
            const hasPrintedUpgrade = (u: DriverCard) => u.upgrades.some((x: DriverCard) => !x.isToken?.());
            const observe = () => {
                const units = arenaUnits(p1);
                seen.note('a printed upgrade on a unit', units.some(hasPrintedUpgrade));
                seen.note('a token upgrade on a unit', units.some((u) => u.upgrades.some((x: DriverCard) => x.isToken?.())));
            };
            let removals = 0;
            return {
                takeTurn: (p) => {
                    observe();
                    if (p === p1) {
                        const hosts = arenaUnits(p1).filter((u) => u.zoneName === 'groundArena');
                        // a host first; then the printed upgrade onto the most-decorated host; then the Shield-bearing ship; then bodies
                        let card = hosts.length === 0 ? playable(p1, 'zealous-soldier', 'battlefield-marine', 'clan-wren-rescuer') : undefined;
                        card = card ?? (hosts.length > 0 && !hosts.some(hasPrintedUpgrade) ? playable(p1, 'ascension-cable') : undefined);
                        card = card ?? playable(p1, 'cloaked-starviper', 'zealous-soldier', 'clan-wren-rescuer', 'battlefield-marine', 'alliance-xwing');
                        if (card) {
                            p1.clickCard(card);
                            settle(p1, [withMost(hosts), ...hosts]);
                            return;
                        }
                        // attack with a bare unit so the decorated hosts stay alive for P2 to remove
                        const bare = (p1.currentActionTargets ?? []).filter((c: DriverCard) => c.isUnit?.() && c.isInPlay?.() && c.upgrades.length === 0);
                        if (bare.length > 0) {
                            p1.clickCard(bare[0]);
                            settle(p1, [context.p2Base]);
                            return;
                        }
                        p1.passAction();
                        return;
                    }
                    const enemies = arenaUnits(p1);
                    // remove a host once it carries the printed upgrade (from round 4, whatever carries the most)
                    const target = enemies.find(hasPrintedUpgrade) ??
                      (context.game.roundNumber >= 4 ? withMost(enemies.filter((u) => u.upgrades.length > 0)) : undefined);
                    let card = target ? playable(p2, 'open-fire', 'vanquish') : undefined;
                    if (card) {
                        removals++;
                    }
                    card = card ?? playable(p2, 'death-star-stormtrooper');
                    if (card) {
                        p2.clickCard(card);
                        settle(p2, target ? [target, ...enemies] : enemies);
                        return;
                    }
                    // P2 never attacks: Stormtroopers swinging every round razed the base before the removal had anything to remove
                    p2.passAction();
                },
                story: () => [
                    ['a printed upgrade was attached', seen.has('a printed upgrade on a unit')],
                    ['a token upgrade was attached', seen.has('a token upgrade on a unit')],
                    ['a decorated host was targeted by removal', removals > 0]
                ]
            };
        }
    },

    pilot: {
        setup: {
            phase: 'setup',
            player1: {
                leader: 'luke-skywalker#faithful-friend',
                base: 'echo-base',
                deck: ['alliance-xwing', 'alliance-xwing', 'alliance-xwing',
                    'academy-graduate', 'academy-graduate', 'academy-graduate',
                    'battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                    'clan-wren-rescuer', 'clan-wren-rescuer', ...rebel]
            },
            player2: {
                leader: 'darth-vader#dark-lord-of-the-sith',
                base: 'security-complex',
                deck: ['vanquish', 'vanquish', 'vanquish',
                    'cell-block-guard', 'cell-block-guard', 'cell-block-guard', 'cell-block-guard',
                    'death-star-stormtrooper', ...villain, ...villain]
            }
        },
        seed: 'swu-pgn-vector-pilot',
        keep: { p1: ['alliance-xwing', 'academy-graduate'], p2: ['vanquish'] },
        rounds: 4,
        driver: 'settle',
        makeTurn: (context) => {
            const p1 = context.player1;
            const p2 = context.player2;
            const seen = new Sightings();
            let vanquished = 0;
            return {
                takeTurn: (p) => {
                    seen.note('a piloted vehicle', arenaUnits(p1).some((u) => u.zoneName === 'spaceArena' && u.upgrades.length > 0));
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
                    if (card) {
                        vanquished++;
                    }
                    card = card ?? playable(p2, 'cell-block-guard', 'death-star-stormtrooper');
                    if (card) {
                        p2.clickCard(card);
                        settle(p2, piloted);
                        return;
                    }
                    p2.passAction();
                },
                story: () => [
                    ['a pilot was flown onto a vehicle', seen.has('a piloted vehicle')],
                    ['a piloted unit was Vanquished', vanquished > 0]
                ]
            };
        }
    },

    capture: {
        setup: {
            phase: 'setup',
            player1: {
                leader: 'leia-organa#alliance-general',
                base: 'echo-base',
                deck: ['take-captive', 'take-captive', 'take-captive',
                    'battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                    'battlefield-marine', ...rebel, ...rebel]
            },
            player2: {
                leader: 'darth-vader#dark-lord-of-the-sith',
                base: 'kestro-city',
                deck: ['open-fire', 'open-fire', 'open-fire',
                    'cell-block-guard', 'cell-block-guard', 'cell-block-guard', 'cell-block-guard',
                    'death-star-stormtrooper', ...villain, ...villain]
            }
        },
        seed: 'swu-pgn-vector-capture',
        keep: { p1: ['take-captive', 'battlefield-marine'], p2: ['open-fire', 'death-star-stormtrooper'] },
        rounds: 3,
        driver: 'settle',
        makeTurn: (context) => {
            const p1 = context.player1;
            const p2 = context.player2;
            const seen = new Sightings();
            return {
                takeTurn: (p) => {
                    const captors = arenaUnits(p1).filter((u) => u.capturedUnits?.length > 0);
                    seen.note('a captive held', captors.length > 0);
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
                },
                story: () => [['a unit was taken captive', seen.has('a captive held')]]
            };
        }
    },

    arrest: {
        setup: {
            phase: 'setup',
            player1: {
                leader: 'boba-fett#collecting-the-bounty',
                base: 'jabbas-palace',
                deck: ['arrest', 'arrest', 'arrest', 'arrest',
                    'peridea-bandit', 'peridea-bandit', 'peridea-bandit', 'peridea-bandit', ...villain, ...villain]
            },
            player2: {
                leader: 'luke-skywalker#faithful-friend',
                base: 'great-grass-plains',
                deck: ['battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine', ...rebel, ...rebel, ...rebel]
            }
        },
        seed: 'swu-pgn-vector-arrest',
        keep: { p1: ['arrest', 'peridea-bandit'], p2: ['battlefield-marine'] },
        rounds: 3,
        driver: 'settle',
        makeTurn: (context) => {
            const p1 = context.player1;
            const p2 = context.player2;
            const seen = new Sightings();
            return {
                takeTurn: (p) => {
                    seen.note('a base holds a captive', context.p1Base.capturedUnits.length > 0);
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
                },
                story: () => [['a base captured a unit', seen.has('a base holds a captive')]]
            };
        }
    },

    effects: {
        setup: {
            phase: 'setup',
            player1: {
                leader: 'darth-vader#dark-lord-of-the-sith',
                base: 'kestro-city',
                deck: ['wolffe#suspicious-veteran', 'wolffe#suspicious-veteran',
                    'rallying-cry', 'rallying-cry', 'rallying-cry',
                    'force-lightning', 'force-lightning', 'give-in-to-your-anger', 'give-in-to-your-anger',
                    ...villain, ...villain, ...rebel]
            },
            player2: {
                leader: 'leia-organa#alliance-general',
                base: 'echo-base',
                deck: ['battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                    'battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine', ...rebel, ...rebel]
            }
        },
        seed: 'swu-pgn-vector-effects',
        // P1 resources its X-Wings, which it never plays
        keep: { p1: ['wolffe#suspicious-veteran', 'rallying-cry', 'force-lightning', 'give-in-to-your-anger', 'death-star-stormtrooper'], p2: ['battlefield-marine'] },
        rounds: 4,
        driver: 'answerAll',
        makeTurn: (context) => {
            const game = context.game;
            const p1 = context.player1;
            const p2 = context.player2;
            const ground = (p: Seat) => arenaUnits(p).filter((u) => u.zoneName === 'groundArena');
            const played = new Set<string>();
            const everPlayed = new Set<string>();
            const once = (name: string) => !played.has(`${game.roundNumber}:${name}`);
            const play = (p: Seat, card: DriverCard, answers: IAnswers = {}) => {
                played.add(`${game.roundNumber}:${card.internalName}`);
                everPlayed.add(card.internalName);
                p.clickCard(card);
                answerAll(context, answers);
            };
            return {
                takeTurn: (p) => {
                    if (p === p1) {
                        const theirs = ground(p2);
                        // raided by Rallying Cry, a Stormtrooper trades with an enemy unit: it leaves play while the effect holds the others
                        if (!once('rallying-cry') && once('trade') && theirs.length > 0) {
                            const trooper = (p1.currentActionTargets ?? []).find((c: DriverCard) => c.internalName === 'death-star-stormtrooper' && c.isInPlay?.());
                            if (trooper) {
                                played.add(`${game.roundNumber}:trade`);
                                everPlayed.add('trade');
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
                    // P2 attacks only P1's units, so both bases outlast the game
                    const attacker = (p2.currentActionTargets ?? []).find((c: DriverCard) => c.isUnit?.() && c.isInPlay?.() && c.zoneName === 'groundArena');
                    if (attacker && ground(p1).length > 0) {
                        p2.clickCard(attacker);
                        answerAll(context, { prefer: ground(p1) });
                        return;
                    }
                    p2.passAction();
                },
                story: () => [
                    ['Rallying Cry was played', everPlayed.has('rallying-cry')],
                    ['a raiding Stormtrooper traded', everPlayed.has('trade')],
                    ['Wolffe was played', everPlayed.has('wolffe#suspicious-veteran')],
                    ['Force Lightning was played', everPlayed.has('force-lightning')]
                ]
            };
        }
    },

    visibility: {
        setup: {
            phase: 'setup',
            player1: {
                leader: 'grand-admiral-thrawn#how-unfortunate',
                base: 'kestro-city',
                deck: ['wartime-trade-official', 'wartime-trade-official', 'wartime-trade-official', 'wartime-trade-official',
                    'regional-governor', 'regional-governor', 'remote-scout', 'remote-scout',
                    'every-day-more-lies', 'every-day-more-lies', 'viper-probe-droid', 'viper-probe-droid',
                    'inferno-four#unforgetting', 'inferno-four#unforgetting', 'foundling', 'foundling',
                    'migs-mayfeld#triggerman', 'migs-mayfeld#triggerman', ...rebel, ...rebel]
            },
            player2: {
                leader: 'leia-organa#alliance-general',
                base: 'echo-base',
                deck: ['battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                    'battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine', ...rebel, ...rebel]
            }
        },
        seed: 'swu-pgn-vector-visibility-14',
        keep: {
            p1: ['wartime-trade-official', 'regional-governor', 'remote-scout', 'every-day-more-lies', 'viper-probe-droid', 'inferno-four#unforgetting',
                'foundling', 'migs-mayfeld#triggerman'],
            p2: ['battlefield-marine']
        },
        rounds: 6,
        driver: 'answerAll',
        makeTurn: (context) => {
            const game = context.game;
            const p1 = context.player1;
            const p2 = context.player2;
            const ground = (p: Seat) => arenaUnits(p).filter((u) => u.zoneName === 'groundArena');
            const played = new Set<string>();
            const once = (name: string) => !played.has(name);
            const play = (p: Seat, card: DriverCard, answers: IAnswers = {}) => {
                played.add(card.internalName);
                p.clickCard(card);
                answerAll(context, answers);
            };
            return {
                takeTurn: (p) => {
                    if (p === p1) {
                        const theirs = ground(p2);
                        // a Wartime Trade Official attacks into a Battlefield Marine and dies: its When Defeated, then Thrawn's
                        // "use that ability again"; Migs Mayfeld uses his once-each-round trigger on the discards, then
                        // attacks into a Battlefield Marine and dies the same round, so his use is reset
                        const ready = (name: string) => (p1.currentActionTargets ?? []).find((c: DriverCard) => c.internalName === name && c.isInPlay?.());
                        const migs = ready('migs-mayfeld#triggerman');
                        if (migs && theirs.length > 0 && !once(`migs-${game.roundNumber}`)) {
                            p1.clickCard(migs);
                            answerAll(context, { prefer: theirs });
                            return;
                        }
                        if (migs && theirs.length > 0 && p2.hand.length > 0 && p1.hand.some((c: DriverCard) => c.internalName === 'every-day-more-lies')) {
                            const lies = playable(p1, 'every-day-more-lies');
                            if (lies) {
                                played.add(`migs-${game.roundNumber}`);
                                play(p1, lies, { prefer: theirs });
                                return;
                            }
                        }
                        const official = ready('wartime-trade-official');
                        if (official && theirs.length > 0 && once(`trade-${game.roundNumber}`)) {
                            played.add(`trade-${game.roundNumber}`);
                            p1.clickCard(official);
                            answerAll(context, { prefer: theirs });
                            return;
                        }
                        let card = playable(p1, 'migs-mayfeld#triggerman');
                        card = card ?? (once('regional-governor') ? playable(p1, 'regional-governor') : undefined);
                        card = card ?? (once('every-day-more-lies') && game.roundNumber >= 4 && p2.hand.length > 0 ? playable(p1, 'every-day-more-lies') : undefined);
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
                    // P2 only builds a board for P1 to attack into
                    const card = playable(p2, 'battlefield-marine', 'alliance-xwing');
                    if (card) {
                        play(p2, card);
                        return;
                    }
                    p2.passAction();
                },
                story: () => [
                    ['Regional Governor named a card', played.has('regional-governor')],
                    ['Viper Probe Droid looked at a hand', played.has('viper-probe-droid')],
                    ['Inferno Four looked at the deck', played.has('inferno-four#unforgetting')],
                    ['Every Day, More Lies made both seats discard', played.has('every-day-more-lies')],
                    ['a Wartime Trade Official attacked', [...played].some((p) => p.startsWith('trade-'))]
                ]
            };
        }
    },

    control: {
        setup: {
            phase: 'setup',
            player1: {
                leader: 'grand-moff-tarkin#tyrant-of-the-outer-rim',
                base: 'echo-base',
                deck: ['gar-saxon#coveting-power', 'gar-saxon#coveting-power', 'foundling', 'foundling', 'foundling',
                    'evidence-of-the-crime', 'evidence-of-the-crime', 'clone', 'clone', 'traitorous', 'traitorous',
                    'arquitens-assault-cruiser', 'arquitens-assault-cruiser', ...rebel, ...rebel, ...rebel]
            },
            player2: {
                leader: 'leia-organa#alliance-general',
                base: 'echo-base',
                deck: ['battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                    'battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'battlefield-marine',
                    'academy-training', 'academy-training', 'academy-training', 'academy-training', ...rebel, ...rebel]
            }
        },
        seed: 'swu-pgn-vector-control-b',
        // P1 resources its X-Wings, which it never plays
        keep: {
            p1: ['gar-saxon#coveting-power', 'foundling', 'evidence-of-the-crime', 'clone', 'traitorous', 'arquitens-assault-cruiser'],
            p2: ['battlefield-marine', 'academy-training']
        },
        rounds: 7,
        driver: 'answerAll',
        makeTurn: (context) => {
            const p1 = context.player1;
            const p2 = context.player2;
            const seen = new Sightings();
            const units = (p: Seat) => arenaUnits(p).filter((u) => !u.isLeader?.());
            const upgraded = () => units(p2).filter((u) => u.upgrades.some((x: DriverCard) => x.internalName === 'academy-training'));
            const gar = () => units(p1).find((u) => u.internalName === 'gar-saxon#coveting-power');
            const played = new Set<string>();
            const once = (name: string) => !played.has(`${context.game.roundNumber}:${name}`);
            const play = (p: Seat, card: DriverCard, answers: IAnswers = {}) => {
                played.add(`${context.game.roundNumber}:${card.internalName}`);
                p.clickCard(card);
                answerAll(context, answers);
            };
            const observe = () => {
                seen.note('a unit P1 controls and P2 owns', units(p1).some((u) => u.owner === p2.player));
                seen.note('a resource P2 owns in P1\'s row', p1.player.resources.some((c: DriverCard) => c.owner === p2.player));
                seen.note('an upgrade P1 controls on a P2 unit', units(p2).some((u) => u.upgrades.some((x: DriverCard) => x.controller === p1.player)));
            };
            return {
                takeTurn: (p) => {
                    observe();
                    if (p === p1) {
                        const theirs = units(p2).filter((u) => u.zoneName === 'groundArena');
                        // Arquitens Ambushes a unit and puts it into play as P1's resource
                        let card = theirs.length > 0 ? playable(p1, 'arquitens-assault-cruiser') : undefined;
                        if (card) {
                            play(p1, card, { prefer: theirs });
                            return;
                        }
                        card = units(p1).length + theirs.length > 0 ? playable(p1, 'clone') : undefined;
                        // Traitorous takes a unit carrying P2's Academy Training when there is one, so the upgrade's
                        // controller differs from its host's
                        card = card ?? (upgraded().length > 0 || (theirs.length > 0 && context.game.roundNumber >= 6) ? playable(p1, 'traitorous') : undefined);
                        card = card ?? (upgraded().length > 0 && units(p1).length > 0 ? playable(p1, 'evidence-of-the-crime') : undefined);
                        card = card ?? (gar() ? undefined : playable(p1, 'gar-saxon#coveting-power'));
                        const garHasFoundling = gar()?.upgrades.some((x: DriverCard) => x.internalName === 'foundling') ?? true;
                        const notMandalorian = units(p1).filter((u) => !u.isToken?.() && !u.hasSomeTrait?.('mandalorian'));
                        card = card ?? ((!garHasFoundling || notMandalorian.length > 0) && once('foundling') ? playable(p1, 'foundling') : undefined);
                        if (card) {
                            const host = gar();
                            // the first Foundling goes on Gar Saxon (his once-each-round trigger); later ones on a unit
                            // that is not a Mandalorian, which then gains the trait
                            const mine = host && !host.upgrades.some((x: DriverCard) => x.internalName === 'foundling')
                                ? [host, ...units(p1)] : [...notMandalorian, ...units(p1)];
                            const prefer = card.internalName === 'traitorous' ? [...theirs.filter((u) => u.upgrades.length > 0), ...theirs]
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
                },
                story: () => [
                    ['a unit P1 controls and P2 owns', seen.has('a unit P1 controls and P2 owns')],
                    ['a resource P2 owns in P1\'s row', seen.has('a resource P2 owns in P1\'s row')],
                    ['Clone was played', [...played].some((p) => p.endsWith(':clone'))]
                ]
            };
        }
    }
};

/**
 * Plays scripted game `name` from a natural setup to P2's concession: builds its board, seeds the game, plays the setup
 * phase and its rounds (resourcing one card each regroup), and fails if the situation it exists for never happened.
 */
export async function playScriptedGame(contextRef: SwuTestContextRef, name: ScriptedGameName): Promise<void> {
    const script = games[name];
    await contextRef.setupTestAsync(script.setup);
    const { context } = contextRef;
    const game = context.game;

    // seeded before the first shuffle, so the game is the same every run
    game.setRandomSeed(script.seed);
    (script.runSetup ?? defaultSetup(script.keep))(context);
    expect(game.currentPhase).withContext(`${name}: setup ended`)
        .toBe(PhaseName.Action);

    const { takeTurn, story } = script.makeTurn(context);
    for (let round = 1; round <= script.rounds; round++) {
        let guard = 0;
        while (inAction(context) && guard++ < 80) {
            if (script.driver === 'settle') {
                takeTurn(context.player1.canAct ? context.player1 : context.player2);
                continue;
            }
            const p = actor(context);
            if (!p.hasPrompt('Choose an action')) {
                answerAll(context);
                continue;
            }
            takeTurn(p);
        }
        expect(game.currentPhase).withContext(`${name}: round ${round} ended`)
            .toBe(PhaseName.Regroup);
        resourceCards(context.player1, context.player1.hand.length > 0 ? 1 : 0, script.keep.p1);
        resourceCards(context.player2, context.player2.hand.length > 0 ? 1 : 0, script.keep.p2);
        expect(game.currentPhase).withContext(`${name}: round ${round + 1} began`)
            .toBe(PhaseName.Action);
    }

    for (const [what, happened] of story()) {
        expect(happened).withContext(`${name}: ${what}`)
            .toBeTrue();
    }

    game.concede(context.player2.id);
    context.ignoreUnresolvedActionPhasePrompts = true;
    expect(game.isEnded).withContext(`${name}: P2 conceded`)
        .toBeTrue();
}
