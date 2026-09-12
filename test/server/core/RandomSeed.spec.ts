import { Game } from '../../../server/game/core/Game';
import type { GameConfiguration } from '../../../server/game/core/GameInterfaces';
import { GameMode } from '../../../server/GameMode';
import { Helpers } from '../../../server/game/core/utils/Helpers';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import * as Settings from '../../../server/Settings';

/**
 * Work item C (docs/plans/01-snapshot-hygiene.md): the RNG seed must be explicit, must produce
 * deterministic shuffles for a given seed, must be minted fresh per `Game` instance, and must
 * never leak into any client-bound payload.
 */
describe('Game RNG seeding', function() {
    const cardDataGetter = new UnitTestCardDataGetter('test/json');
    const router = jasmine.createSpyObj('router', ['handleError', 'handleSerializationFailure']);

    function buildGameConfiguration(overrides: Partial<GameConfiguration> = {}): GameConfiguration {
        return {
            id: 'test-game-id',
            owner: 'player1',
            gameMode: GameMode.Premier,
            players: [
                Settings.getUserWithDefaultsSet({ id: 'player1', username: 'player1' }),
                Settings.getUserWithDefaultsSet({ id: 'player2', username: 'player2' }),
            ],
            allowSpectators: false,
            cardDataGetter,
            pushUpdate: () => true,
            buildSafeTimeout: () => undefined,
            userTimeoutDisconnect: () => undefined,
            ...overrides,
        };
    }

    // Recursively collects every key name that appears anywhere in a value, so a seed field
    // nested arbitrarily deep in a serialized payload can't slip past a shallow key check.
    function collectAllKeysRecursively(value: unknown, seenObjects: Set<unknown> = new Set<unknown>()): string[] {
        if (value === null || typeof value !== 'object') {
            return [];
        }
        if (seenObjects.has(value)) {
            return [];
        }
        seenObjects.add(value);

        const keys: string[] = [];

        for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
            keys.push(key);
            keys.push(...collectAllKeysRecursively(nestedValue, seenObjects));
        }
        return keys;
    }

    it('produces identical shuffles for two games constructed with the same explicit seed', function() {
        const sharedSeed = 'p1-c-determinism-test-seed';
        const game1 = new Game(buildGameConfiguration({ id: 'game-1', seed: sharedSeed }), { router });
        const game2 = new Game(buildGameConfiguration({ id: 'game-2', seed: sharedSeed }), { router });

        expect(game1.randomSeed).toBe(sharedSeed);
        expect(game2.randomSeed).toBe(sharedSeed);

        // Same seed + same input array must produce the same shuffle output; this is exactly the
        // algorithm DeckZone.shuffle() uses for deck shuffling (Helpers.shuffle(deck, game.randomGenerator)).
        const deckOfCardIds = Array.from({ length: 50 }, (_, i) => `card-${i}`);
        const shuffledDeck1 = Helpers.shuffle(deckOfCardIds, game1.randomGenerator);
        const shuffledDeck2 = Helpers.shuffle(deckOfCardIds, game2.randomGenerator);

        expect(shuffledDeck1).toEqual(shuffledDeck2);
        // Sanity check that the shared seed actually produced a non-trivial shuffle
        expect(shuffledDeck1).not.toEqual(deckOfCardIds);
    });

    it('mints a fresh seed for every Game instance created from the same lobby configuration (Bo3)', function() {
        // buildGameSettings() in Lobby.ts never sets `seed`, so this mirrors the real Bo3 flow of
        // calling startGameAsync() -> new Game(this.buildGameSettings(), ...) once per game in the set.
        const bo3GameOneConfig = buildGameConfiguration({ id: 'bo3-game-1' });
        const bo3GameTwoConfig = buildGameConfiguration({ id: 'bo3-game-2' });

        const bo3GameOne = new Game(bo3GameOneConfig, { router });
        const bo3GameTwo = new Game(bo3GameTwoConfig, { router });

        expect(bo3GameOne.randomSeed).toBeTruthy();
        expect(bo3GameTwo.randomSeed).toBeTruthy();
        expect(bo3GameOne.randomSeed).not.toBe(bo3GameTwo.randomSeed);
    });

    // The two checks below must exercise a *started* game: `Game.getState()` only builds the real
    // client-bound payload once `this.started` is true, otherwise it takes an early-return shortcut
    // that has essentially no content of any kind, seed or otherwise. Asserting the seed is absent
    // from that empty shortcut payload would pass trivially regardless of whether the real
    // `getState()` branch ever leaked the seed, so these use the `integration()` harness (see
    // test/server/core/Game.spec.ts for the same pattern) to drive a real game through
    // initialization, then inject a known seed via `setRandomSeed` before capturing state.
    integration(function(contextRef) {
        describe('once the game has started', function() {
            const knownSeed = 'super-secret-seed-value';

            beforeEach(function() {
                return contextRef.setupTestAsync({ phase: 'action' });
            });

            it('includes the seed in the bug-report game state capture', function() {
                const { context } = contextRef;
                context.game.setRandomSeed(knownSeed);

                const capturedState = context.game.captureGameState('any');

                expect(capturedState.seed).toBe(knownSeed);
            });

            it('never includes the seed anywhere in the client-bound game state payload', function() {
                const { context } = contextRef;
                context.game.setRandomSeed(knownSeed);

                expect(context.game.started).toBeTrue();

                const clientState = context.game.getState(context.player1.id);

                // Sanity check that this is the real, non-trivial getState() payload and not the
                // pre-start/error shortcut, so the key-walk below is actually exercising something.
                expect(Object.keys(clientState).length).toBeGreaterThan(5);

                const allKeys = collectAllKeysRecursively(clientState);
                expect(allKeys).not.toContain('seed');
                expect(allKeys).not.toContain('randomSeed');

                // Belt-and-braces: the literal seed value must not appear anywhere in the serialized payload either,
                // in case it were ever exposed under a differently-named field.
                expect(JSON.stringify(clientState)).not.toContain(knownSeed);
            });

            // Residual (documented, not fixed here): the plan's acceptance criterion also names
            // "lobby state" (Lobby.getLobbyState()). The integration harness constructs a `Game`
            // directly and does not stand up a `Lobby`, and building that infrastructure for this
            // one assertion is disproportionate at "standard" proof level for a tier-1 item.
            // `Lobby.getLobbyState()` was manually inspected and does not reference `game.randomSeed`
            // or `_randomSeed`.
        });
    });
});
