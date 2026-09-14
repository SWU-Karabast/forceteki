import { getUserWithDefaultsSet } from '../../server/Settings.js';
import type { IMatchLoadConfig } from '../../server/game/core/stateSerialization/MatchLoader.js';

/**
 * Builds an `IMatchLoadConfig` for loading a document produced from `context.game` back into a second,
 * independent headless game, for `P2-C2`'s specs.
 *
 * Feasibility, established rather than assumed: `GameFlowWrapper` already constructs a `Game` from exactly
 * these inputs (`cardDataGetter`, a router, two `IUser`s) inside the suite; `context.game.cardDataGetter` is
 * public; and the suite's `afterEach` prompt/serialization checks read `context.game` only, so a second
 * loaded game never trips them.
 *
 * The router is a jasmine spy whose `handleError` rethrows, matching `IntegrationHelper`'s own router so a
 * reported error fails the spec instead of being silently logged. `Lobby`'s only surface the loader touches
 * is `_router.id` (read via `Game.lobbyId`), which is never called during a load, so casting the spy to
 * `Lobby` is safe; `Game` exposes no public getter for the concrete `_router` field, hence the cast.
 */
export function buildLoadConfig(context: SwuTestContext, overrides: Partial<IMatchLoadConfig> = {}): IMatchLoadConfig {
    const router = jasmine.createSpyObj('gameRouter', ['gameWon', 'playerLeft', 'handleError', 'handleGameEnd', 'handleUndoGameEnd']);
    router.handleError.and.callFake((game: unknown, error: Error) => {
        throw error;
    });

    return {
        cardDataGetter: context.game.cardDataGetter,
        router: router as unknown as import('../../server/gamenode/Lobby.js').Lobby,
        seats: [
            { seat: 'p1', user: getUserWithDefaultsSet({ id: context.player1Object.id, username: context.player1Object.name }) },
            { seat: 'p2', user: getUserWithDefaultsSet({ id: context.player2Object.id, username: context.player2Object.name }) },
        ],
        ...overrides,
    };
}
