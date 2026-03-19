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
const snapshotHeap = (label) => {
    if (typeof global.gc === 'function') {
        global.gc();
    }

    const heapUsed = process.memoryUsage().heapUsed;
    console.info(`[card-memory] ${label}: heapUsed=${toMiB(heapUsed)} MiB`);
    return heapUsed;
};

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
        console.info('[card-memory] global.gc is unavailable. Run node with --expose-gc for cleaner baseline snapshots.');
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
    const before = snapshotHeap('before-allocation');

    for (const [, cardData] of cardEntries) {
        const cardDataForBenchmark = normalizeCardDataForBenchmark(cardData);
        retainedCards.push(createUnimplementedCard(owner, cardDataForBenchmark));
    }

    snapshotHeap('after-allocation-pass');

    global.__retainedCardMemoryBenchmarkCards = retainedCards;

    const after = snapshotHeap('after-allocation');
    const deltaBytes = after - before;
    const retainedCount = retainedCards.length;

    console.info(`[card-memory] retained=${retainedCount} card objects`);
    console.info(`[card-memory] heapDelta=${toMiB(deltaBytes)} MiB (${deltaBytes} bytes)`);
    console.info(`[card-memory] bytes-per-object=${(deltaBytes / retainedCount).toFixed(2)}`);
    console.info(`[card-memory] RESULT retained=${retainedCount} deltaBytes=${deltaBytes}`);
}

main().catch((error) => {
    console.error('[card-memory] benchmark failed', error);
    process.exitCode = 1;
});
