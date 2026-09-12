import { Game } from '../../../../server/game/core/Game';
import type { GameConfiguration } from '../../../../server/game/core/GameInterfaces';
import { GameMode } from '../../../../server/GameMode';
import { UnitTestCardDataGetter } from '../../../../server/utils/cardData/UnitTestCardDataGetter';
import * as Settings from '../../../../server/Settings';
import DynamicOngoingEffectImpl from '../../../../server/game/core/ongoingEffect/effectImpl/DynamicOngoingEffectImpl';
import { OngoingCardEffect } from '../../../../server/game/core/ongoingEffect/OngoingCardEffect';
import { EffectName } from '../../../../server/game/core/Constants';
import type { Card } from '../../../../server/game/core/card/Card';
import type { AbilityContext } from '../../../../server/game/core/ability/AbilityContext';

/**
 * p1-a work item A4: OngoingEffect.refreshContext caches its AbilityContext instead of allocating a fresh
 * one (plus a throwaway OngoingEffectSource) on every rollback. See .anvil/p1-a/handoff.md section 8B.
 */
describe('OngoingEffect context caching', function() {
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

    interface IRegistrarInternals {
        lastGameObjectId: number;
    }

    function getRegistrar(game: Game): IRegistrarInternals {
        return game.gameObjectManager as unknown as IRegistrarInternals;
    }

    interface IOngoingEffectImplInternals {
        context: AbilityContext;
    }

    it('reuses the same context object across a refresh, updating only the player', function() {
        const game = new Game(buildGameConfiguration(), { router });
        const [player1, player2] = game.getPlayers();
        // Mutable stub so we can flip the controller between refreshes; OngoingCardEffect's
        // targetsSourceOnly early return means no zone machinery is required for this stub.
        const source = { controller: player1, canBeInPlay: () => false } as unknown as Card;
        const impl = new DynamicOngoingEffectImpl<number>(game, EffectName.ModifyStats, () => 1);
        const effect = new OngoingCardEffect(game, source, {}, impl);

        const contextBefore = effect.context;
        expect(contextBefore.player).toBe(player1);
        expect(contextBefore.source).toBe(source);
        expect(contextBefore.ongoingEffect).toBe(effect.ongoingEffect);
        expect((impl as unknown as IOngoingEffectImplInternals).context).toBe(contextBefore);

        (source as unknown as { controller: typeof player2 }).controller = player2;
        const lastIdBefore = getRegistrar(game).lastGameObjectId;

        effect.refreshContext();

        expect(effect.context).toBe(contextBefore);
        expect(effect.context.player).toBe(player2);
        expect(effect.context.source).toBe(source);
        expect(effect.context.ongoingEffect).toBe(effect.ongoingEffect);
        expect((impl as unknown as IOngoingEffectImplInternals).context).toBe(effect.context);
        expect(getRegistrar(game).lastGameObjectId).toBe(lastIdBefore);
    });

    it('registers no throwaway OngoingEffectSource GameObject at construction', function() {
        const game = new Game(buildGameConfiguration(), { router });
        const player1 = game.getPlayers()[0];
        const source = { controller: player1, canBeInPlay: () => false } as unknown as Card;
        const impl = new DynamicOngoingEffectImpl<number>(game, EffectName.ModifyStats, () => 1);

        // Every GameObjectBase registers unconditionally at construction (GameObjectBase's constructor calls
        // gameObjectManager.register), so lastGameObjectId is a precise allocation counter here. The only
        // GameObjectBase this construction should register is the OngoingCardEffect itself; the old
        // `getFrameworkContext(player)` path additionally built a throwaway `AbilityContext`-owned
        // `OngoingEffectSource`, which building the context directly with `source` set avoids.
        const lastIdBefore = getRegistrar(game).lastGameObjectId;
        new OngoingCardEffect(game, source, {}, impl);
        expect(getRegistrar(game).lastGameObjectId).toBe(lastIdBefore + 1);
    });
});
