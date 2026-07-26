/**
 * Card allocation memory benchmark.
 *
 * Ported from `feature/quick-undo-deltas-morph`. Instantiates one Card object for
 * every card in the dataset and reports the retained heap cost per object. This is
 * the per-GameObject memory floor that Plans 3 and 5 are trying to move: snapshot
 * cost is O(live objects), so bytes-per-card multiplies into every snapshot.
 *
 * Run through `node scripts/run-performance-benchmarks.js`, or directly:
 *     npm run build-test
 *     node --expose-gc scripts/card-memory-benchmark.js
 *
 * Set CARD_MEMORY_REPORT_PATH to have the result written as JSON for the report renderer.
 */

const fs = require('fs');
const path = require('path');

const buildRoot = path.resolve(__dirname, '../build');
const requiredBuildFiles = [
    path.join(buildRoot, 'test/helpers/GameStateBuilder.js'),
    path.join(buildRoot, 'test/helpers/GameFlowWrapper.js'),
    path.join(buildRoot, 'test/helpers/DeckBuilder.js'),
    path.join(buildRoot, 'server/game/core/card/CardHelpers.js'),
    path.join(buildRoot, 'server/game/core/snapshot/SnapshotManager.js')
];

for (const requiredFile of requiredBuildFiles) {
    if (!fs.existsSync(requiredFile)) {
        throw new Error(
            `Missing build artifact: ${requiredFile}\n` +
            'Run "npm run build-test" first, then run this benchmark again.'
        );
    }
}

const GameStateBuilder = require('../build/test/helpers/GameStateBuilder.js');
const GameFlowWrapper = require('../build/test/helpers/GameFlowWrapper.js');
const DeckBuilder = require('../build/test/helpers/DeckBuilder.js');
const { createUnimplementedCard } = require('../build/server/game/core/card/CardHelpers.js');
const { UndoMode } = require('../build/server/game/core/snapshot/SnapshotManager.js');

const toMiB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

const memorySample = () => {
    const usage = process.memoryUsage();
    return { heapUsed: usage.heapUsed, external: usage.external, rss: usage.rss };
};

const snapshotMemory = (label) => {
    if (typeof global.gc === 'function') {
        global.gc();
    }

    const sample = memorySample();
    console.info(`[card-memory] ${label}: heapUsed=${toMiB(sample.heapUsed)} MiB external=${toMiB(sample.external)} MiB`);
    return sample;
};

/**
 * The dataset contains cards whose numeric/arena fields are absent (non-unit types).
 * Fill in neutral defaults so every card can be constructed as a unit-shaped object and
 * the per-object cost is measured over the whole dataset rather than a filtered subset.
 */
const normalizeCardDataForBenchmark = (cardData) => {
    if (cardData == null || typeof cardData !== 'object') {
        return cardData;
    }

    const normalized = { ...cardData };

    if (normalized.cost == null) {
        normalized.cost = 0;
    }
    if (normalized.power == null) {
        normalized.power = 0;
    }
    if (normalized.hp == null) {
        normalized.hp = 0;
    }
    if (normalized.arena == null) {
        normalized.arena = 'ground';
    }

    return normalized;
};

async function main() {
    if (typeof global.gc !== 'function') {
        console.info('[card-memory] global.gc is unavailable. Run node with --expose-gc for meaningful retained-memory numbers.');
    }

    const gameStateBuilder = new GameStateBuilder();
    const gameRouter = {
        gameWon: () => undefined,
        playerLeft: () => undefined,
        handleError: (_game, error) => {
            throw error;
        },
        handleGameEnd: () => undefined,
        handleUndoGameEnd: () => undefined
    };

    const gameFlowWrapper = new GameFlowWrapper(
        gameStateBuilder.cardDataGetter,
        gameRouter,
        { id: '111', username: 'player1', settings: { optionSettings: { autoSingleTarget: false } } },
        { id: '222', username: 'player2', settings: { optionSettings: { autoSingleTarget: false } } },
        UndoMode.Disabled
    );

    const context = {};
    gameStateBuilder.attachTestInfoToObj(context, gameFlowWrapper, 'player1', 'player2');
    await gameStateBuilder.setupGameStateAsync(context, {
        phase: 'action',
        player1: {},
        player2: {}
    });

    const deckBuilder = new DeckBuilder(gameStateBuilder.cardDataGetter);
    const cardEntries = Array.from(deckBuilder.cards.entries());
    const retainedCards = [];
    const owner = context.player1Object;

    console.info(`[card-memory] cards-in-dataset=${cardEntries.length}`);
    const before = snapshotMemory('before-allocation');

    for (const [, cardData] of cardEntries) {
        retainedCards.push(createUnimplementedCard(owner, normalizeCardDataForBenchmark(cardData)));
    }

    // Keep the cards reachable across the forced GC so the delta measures retention, not churn.
    global.__retainedCardMemoryBenchmarkCards = retainedCards;

    const after = snapshotMemory('after-allocation');
    const heapDeltaBytes = after.heapUsed - before.heapUsed;
    const externalDeltaBytes = after.external - before.external;
    const totalDeltaBytes = heapDeltaBytes + externalDeltaBytes;
    const retainedCount = retainedCards.length;

    const result = {
        cardsInDataset: cardEntries.length,
        retainedCardCount: retainedCount,
        heapDeltaBytes,
        externalDeltaBytes,
        totalDeltaBytes,
        bytesPerCard: Math.round(totalDeltaBytes / retainedCount),
        exposeGc: typeof global.gc === 'function'
    };

    console.info(`[card-memory] retained=${retainedCount} card objects`);
    console.info(`[card-memory] heapDelta=${toMiB(heapDeltaBytes)} MiB (${heapDeltaBytes} bytes)`);
    console.info(`[card-memory] bytes-per-object=${result.bytesPerCard}`);
    console.info(`[card-memory] RESULT ${JSON.stringify(result)}`);

    const reportPath = process.env.CARD_MEMORY_REPORT_PATH;
    if (reportPath) {
        fs.mkdirSync(path.dirname(path.resolve(reportPath)), { recursive: true });
        fs.writeFileSync(path.resolve(reportPath), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
        console.info(`[card-memory] report written to ${reportPath}`);
    }
}

main().catch((error) => {
    console.error('[card-memory] benchmark failed', error);
    process.exitCode = 1;
});
