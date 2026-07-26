/**
 * Board setups for the snapshot/undo benchmarks.
 *
 * Ported from `feature/quick-undo-deltas-morph`. These setups are the
 * comparability contract for `docs/plans/performance/`: **changing a scenario
 * invalidates every prior report that used it.** Add a new scenario instead of
 * editing an existing one, and note the addition in the report.
 *
 * The set spans board density on purpose. Snapshot cost on the current engine is
 * O(live objects), so the 40-card setups are the ones that predict production
 * pain, while `compact-board` keeps iteration counts high enough to catch tight-loop
 * regressions. The sparse variants hold total card count fixed while shrinking the
 * number of *mutated* cards, which is what later delta work has to exploit.
 */

export interface IBenchmarkScenario {

    /** Caps how many arena cards the benchmark mutates, to model low-mutation-density actions. */
    mutatedCardLimit?: number;
    name: string;
    rollbackIterations: number;
    setup: SwuSetupTestOptions;
    snapshotIterations: number;
}

interface ICardCounts {
    groundArena: number;
    hand: number;
    resources: number;
    spaceArena: number;
}

interface ICardPools {
    groundArena: string[];
    hand: string[];
    spaceArena: string[];
}

function createRepeatedCardList(cardNames: string[], count: number): string[] {
    const cards: string[] = [];
    for (let index = 0; index < count; index++) {
        cards.push(cardNames[index % cardNames.length]);
    }

    return cards;
}

function createConfiguredBenchmarkPlayer(cardPools: ICardPools, leader: string, cardCounts: ICardCounts) {
    const hand = createRepeatedCardList(cardPools.hand, cardCounts.hand);
    const groundArena = createRepeatedCardList(cardPools.groundArena, cardCounts.groundArena);
    const spaceArena = createRepeatedCardList(cardPools.spaceArena, cardCounts.spaceArena);
    const resources = cardCounts.resources;

    const totalCards = hand.length + groundArena.length + spaceArena.length + resources;
    if (totalCards !== 40) {
        throw new Error(`Expected 40 cards in full benchmark setup, got ${totalCards}`);
    }

    return { hand, groundArena, spaceArena, resources, leader };
}

function createFortyCardBenchmarkPlayer(cardPools: ICardPools, leader: string) {
    return createConfiguredBenchmarkPlayer(cardPools, leader, {
        hand: 8,
        groundArena: 10,
        spaceArena: 10,
        resources: 12
    });
}

function createSparseFortyCardBenchmarkPlayer(cardPools: ICardPools, leader: string) {
    return createConfiguredBenchmarkPlayer(cardPools, leader, {
        hand: 14,
        groundArena: 3,
        spaceArena: 3,
        resources: 20
    });
}

function createUltraSparseFortyCardBenchmarkPlayer(cardPools: ICardPools, leader: string) {
    return createConfiguredBenchmarkPlayer(cardPools, leader, {
        hand: 16,
        groundArena: 1,
        spaceArena: 1,
        resources: 22
    });
}

const fullBoardCardPools: { player1: ICardPools; player2: ICardPools } = {
    player1: {
        hand: ['republic-attack-pod', 'battlefield-marine', 'waylay', 'vanquish'],
        groundArena: ['fleet-lieutenant', 'battlefield-marine', 'pyke-sentinel', 'wampa', 'consular-security-force'],
        spaceArena: ['cartel-spacer', 'alliance-xwing', 'green-squadron-awing', 'tieln-fighter', 'system-patrol-craft']
    },
    player2: {
        hand: ['waylay', 'battlefield-marine', 'vanquish', 'open-fire'],
        groundArena: ['greedo#slow-on-the-draw', 'rey#keeping-the-past', 'superlaser-technician', 'pyke-sentinel', 'wampa'],
        spaceArena: ['tieln-fighter', 'alliance-xwing', 'green-squadron-awing', 'cartel-spacer', 'imperial-interceptor']
    }
};

export const benchmarkScenarios: IBenchmarkScenario[] = [
    {
        // Small board that keeps iteration counts high enough to spot regressions in tight loops.
        name: 'compact-board',
        snapshotIterations: 50,
        rollbackIterations: 25,
        setup: {
            phase: 'action',
            player1: {
                hand: ['republic-attack-pod', 'battlefield-marine', 'waylay'],
                groundArena: ['fleet-lieutenant', 'battlefield-marine', 'pyke-sentinel', 'wampa'],
                spaceArena: ['cartel-spacer', 'alliance-xwing'],
                resources: 8,
                leader: 'fennec-shand#honoring-the-deal'
            },
            player2: {
                hand: ['waylay', 'battlefield-marine'],
                groundArena: ['greedo#slow-on-the-draw', 'rey#keeping-the-past', 'superlaser-technician'],
                spaceArena: ['tieln-fighter', 'alliance-xwing'],
                resources: 8,
                leader: 'luke-skywalker#faithful-friend'
            }
        }
    },
    {
        // Larger board with more cards and attachments so full-snapshot costs scale up.
        name: 'large-board',
        snapshotIterations: 25,
        rollbackIterations: 15,
        setup: {
            phase: 'action',
            player1: {
                hand: ['republic-attack-pod', 'battlefield-marine', 'waylay', 'battlefield-marine', 'waylay'],
                groundArena: [
                    { card: 'fleet-lieutenant', upgrades: ['academy-training'] },
                    'battlefield-marine',
                    'pyke-sentinel',
                    'wampa',
                    'consular-security-force',
                    'first-legion-snowtrooper',
                    'battlefield-marine',
                    { card: 'death-trooper', upgrades: ['academy-training'] }
                ],
                spaceArena: [
                    'cartel-spacer',
                    'alliance-xwing',
                    'green-squadron-awing',
                    'tieln-fighter',
                    'cartel-spacer',
                    { card: 'alliance-xwing', upgrades: ['entrenched'] }
                ],
                resources: 12,
                leader: 'fennec-shand#honoring-the-deal'
            },
            player2: {
                hand: ['waylay', 'battlefield-marine', 'waylay', 'battlefield-marine'],
                groundArena: [
                    'greedo#slow-on-the-draw',
                    'rey#keeping-the-past',
                    'superlaser-technician',
                    'pyke-sentinel',
                    'wampa',
                    'battlefield-marine',
                    'consular-security-force',
                    { card: 'atst', upgrades: ['academy-training'] }
                ],
                spaceArena: [
                    'tieln-fighter',
                    'alliance-xwing',
                    'green-squadron-awing',
                    'cartel-spacer',
                    'tieln-fighter',
                    { card: 'alliance-xwing', upgrades: ['entrenched'] }
                ],
                resources: 12,
                leader: 'luke-skywalker#faithful-friend'
            }
        }
    },
    {
        // Approximate a full 40-card-per-player state across arenas, hand, and resources.
        // Lower iteration counts keep local runs practical at the largest benchmark size.
        name: 'forty-cards-per-player',
        snapshotIterations: 10,
        rollbackIterations: 6,
        setup: {
            phase: 'action',
            player1: createFortyCardBenchmarkPlayer(fullBoardCardPools.player1, 'fennec-shand#honoring-the-deal'),
            player2: createFortyCardBenchmarkPlayer(fullBoardCardPools.player2, 'luke-skywalker#faithful-friend')
        }
    },
    {
        // Same 40-card total, but most cards sit outside the arenas so only a small subset
        // of cards is mutated against a large serialized game state.
        name: 'forty-cards-sparse-mutations',
        snapshotIterations: 12,
        rollbackIterations: 8,
        setup: {
            phase: 'action',
            player1: createSparseFortyCardBenchmarkPlayer(fullBoardCardPools.player1, 'fennec-shand#honoring-the-deal'),
            player2: createSparseFortyCardBenchmarkPlayer(fullBoardCardPools.player2, 'luke-skywalker#faithful-friend')
        }
    },
    {
        // Force an even lower mutation density: only four arena cards total can be exhausted,
        // while the overall serialized state still holds 40 cards per player.
        name: 'forty-cards-four-mutated',
        mutatedCardLimit: 4,
        snapshotIterations: 15,
        rollbackIterations: 10,
        setup: {
            phase: 'action',
            player1: createUltraSparseFortyCardBenchmarkPlayer(fullBoardCardPools.player1, 'fennec-shand#honoring-the-deal'),
            player2: createUltraSparseFortyCardBenchmarkPlayer(fullBoardCardPools.player2, 'luke-skywalker#faithful-friend')
        }
    }
];
