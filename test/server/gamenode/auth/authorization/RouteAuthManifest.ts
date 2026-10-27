import type { RouteMethod } from '../../../../helpers/server/RouteRecorder';

/**
 * Who a route lets in, as the server enforces it today.
 *
 * - `public`: no authentication of any kind; the caller is never identified.
 * - `anonymous-ok`: `authMiddleware` identifies the caller (an anonymous one gets a throwaway identity) and
 *   the handler serves anonymous and signed-in callers alike.
 * - `signed-in`: `authMiddleware`, and the handler refuses an anonymous caller.
 * - `session-token`: no middleware; the handler reads the session token itself, to make or find the account
 *   that identity has. Refuses a request with no session, and serves one that has a session whether or not
 *   its account exists yet.
 * - `moderator` / `admin`: `authMiddleware` refuses a caller who lacks the role. An admin passes every
 *   role check; a moderator does not pass an admin one.
 * - `shared-secret`: the handler compares a key the FE server puts in the body with `INTRASERVICE_SECRET`.
 *   Where the route acts on a user's account it also sits behind `authMiddleware`, for the session the FE
 *   server forwards.
 * - `api-key`: no middleware; the handler compares an `Authorization: api-key <key>` header with
 *   `PROFILE_CAPTURE_SECRET`.
 */
export type RouteAccess = 'public' | 'anonymous-ok' | 'signed-in' | 'session-token' | 'moderator' | 'admin' | 'shared-secret' | 'api-key';

export interface IRouteAuthRow {
    method: RouteMethod;

    /** As the server registers it, `:parameters` included. */
    path: string;
    access: RouteAccess;

    /** The route exists only when `ENVIRONMENT` is `development`. */
    devOnly?: true;

    /** What a caller with no credentials at all gets. */
    unauthenticated: IUnauthenticatedOutcome;
}

/**
 * What a caller with no credentials at all gets.
 *
 * - `refused`: turned away as unauthenticated, which is a 401 or a 403 whose body does not say `success: true`.
 *   Routes use one or the other and for most nothing depends on which, so that is not asserted. Where the FE does
 *   branch on the exact code, `status` is given and `reliedOnBy` says what reads it.
 * - otherwise, served: let through to the handler. `status` and `body` are given where the response is the
 *   route's own answer to an empty request (a 200, or a validation failure); without a `status` the spec checks
 *   only that the request was not refused.
 */
export interface IUnauthenticatedOutcome {
    refused?: true;
    status?: number;
    body?: Record<string, unknown>;

    /** For a refusal with an exact `status`: what in the FE reads that code. */
    reliedOnBy?: string;
}

/** Turned away as unauthenticated, with a 401 or a 403. */
const refused: IUnauthenticatedOutcome = { refused: true };

/** Turned away with exactly this code, because the FE branches on it. */
const refusedWith = (status: 401 | 403, reliedOnBy: string): IUnauthenticatedOutcome => ({ refused: true, status, reliedOnBy });

/** Let through to the handler; `status` and `body` only when the response is the route's own answer. */
const served = (status?: number, body?: Record<string, unknown>): IUnauthenticatedOutcome => ({ status, body });

/**
 * Every HTTP route the game node registers, and who it lets in. `RouteAuthManifest.spec.ts` fails when a
 * route exists that is not listed here, or a row here names a route that no longer exists, so a change that
 * adds an endpoint has to decide its authentication and say so in this table.
 *
 * Rows are in registration order (`GameServer.setupAppRoutes`, then `setupDevAppRoutes`). The `unauthenticated`
 * outcomes were measured against the running server. A refusal's exact code is asserted only where the FE reads
 * it (`forceteki-client`, `ServerAndLocalStorageUtils`): the routes disagree about 401 versus 403 for an
 * anonymous caller, and a spec that required today's choice for every route would stand in the way of making
 * them agree.
 *
 * Not in this table: what a route does for a caller who is let in. That is the job of the specs for the
 * feature (lobbies, decks, moderation); this one is about who gets that far.
 */
export const routeAuthManifest: readonly IRouteAuthRow[] = [
    { method: 'get', path: '/api/get-unimplemented', access: 'public', unauthenticated: served(200) },

    // refused only while `allowAnonymousSpectators` is off, which is how the harness (like production) runs
    { method: 'post', path: '/api/spectate-game', access: 'signed-in', unauthenticated: refused },

    { method: 'post', path: '/api/create-user', access: 'session-token', unauthenticated: refusedWith(401, 'FE `createUserAsync` treats a 401 as a failed sign-in') },
    { method: 'post', path: '/api/get-user', access: 'anonymous-ok', unauthenticated: served(200) },
    { method: 'get', path: '/api/user/:userId/swustatsLink', access: 'signed-in', unauthenticated: refusedWith(401, 'FE `checkSwuStatsLinkStatus` reads a 401 as "not linked"') },
    { method: 'get', path: '/api/user/:userId/swustats/decks', access: 'signed-in', unauthenticated: refusedWith(401, 'FE `fetchSwuStatsDecks` reads a 401 as "not linked"') },
    { method: 'get', path: '/api/user/:userId/swubaseLink', access: 'signed-in', unauthenticated: refusedWith(401, 'FE `checkSwubaseLinkStatus` reads a 401 as "not linked"') },
    { method: 'post', path: '/api/toggle-welcome-message', access: 'signed-in', unauthenticated: refused },
    { method: 'put', path: '/api/user/:userId/undo-popup-seen', access: 'signed-in', unauthenticated: refused },
    { method: 'put', path: '/api/user/:userId/timer-popup-seen', access: 'signed-in', unauthenticated: refused },
    { method: 'post', path: '/api/get-change-username-info', access: 'signed-in', unauthenticated: refused },
    { method: 'post', path: '/api/change-username', access: 'signed-in', unauthenticated: refused },
    { method: 'post', path: '/api/set-moderation-seen', access: 'signed-in', unauthenticated: refused },
    { method: 'post', path: '/api/set-username-changes-blocked-seen', access: 'signed-in', unauthenticated: refused },
    { method: 'post', path: '/api/set-reporting-disabled-seen', access: 'signed-in', unauthenticated: refused },

    // checked in the handler against INTRASERVICE_SECRET, after `authMiddleware` has identified the forwarded session (see ServiceCredentials.spec.ts)
    { method: 'post', path: '/api/link-swustats', access: 'shared-secret', unauthenticated: refused },
    { method: 'post', path: '/api/unlink-swustats', access: 'signed-in', unauthenticated: refused },
    { method: 'post', path: '/api/link-swubase', access: 'shared-secret', unauthenticated: refused },
    { method: 'post', path: '/api/unlink-swubase', access: 'signed-in', unauthenticated: refused },
    { method: 'put', path: '/api/user/:userId/preferences', access: 'signed-in', unauthenticated: refused },
    { method: 'post', path: '/api/run-profile', access: 'api-key', unauthenticated: refused },

    { method: 'post', path: '/api/get-decks', access: 'signed-in', unauthenticated: refusedWith(403, 'FE `loadDecks` reads a 403 as "not signed in" and uses the decks in local storage') },
    { method: 'put', path: '/api/get-deck/:deckId/rename', access: 'signed-in', unauthenticated: refused },
    { method: 'post', path: '/api/get-deck/:deckId', access: 'signed-in', unauthenticated: refused },
    { method: 'post', path: '/api/save-deck', access: 'signed-in', unauthenticated: refused },
    { method: 'put', path: '/api/deck/:deckId/favorite', access: 'signed-in', unauthenticated: refused },
    { method: 'post', path: '/api/delete-decks', access: 'signed-in', unauthenticated: refusedWith(401, 'FE `deleteDecks` reads a 401 as "not signed in" and removes the decks from local storage') },

    { method: 'post', path: '/api/resolve-deck-link', access: 'anonymous-ok', unauthenticated: served(400, { error: 'Missing deckLink' }) },

    // a 403, but for being outside the lobby rather than for being anonymous
    { method: 'post', path: '/api/lobby/:lobbyId/change-deck', access: 'anonymous-ok', unauthenticated: served(403, { errorCode: 'NotLobbyMember' }) },

    { method: 'get', path: '/api/ongoing-games', access: 'public', unauthenticated: served(200) },

    // an empty body is not a lobby to create, join or queue for, so these answer with their own validation
    // failure (or an error, for `create-lobby`); the spec checks only that the caller was not turned away
    { method: 'post', path: '/api/create-lobby', access: 'anonymous-ok', unauthenticated: served() },
    { method: 'get', path: '/api/available-lobbies', access: 'public', unauthenticated: served(200) },
    { method: 'post', path: '/api/join-lobby', access: 'anonymous-ok', unauthenticated: served(404, { success: false, message: 'Lobby not found' }) },
    { method: 'post', path: '/api/enter-queue', access: 'anonymous-ok', unauthenticated: served(400, { success: false }) },

    { method: 'get', path: '/api/health', access: 'public', unauthenticated: served(200) },
    { method: 'get', path: '/api/all-leaders', access: 'public', unauthenticated: served(200) },

    { method: 'get', path: '/api/cosmetics', access: 'anonymous-ok', unauthenticated: served(200) },
    { method: 'post', path: '/api/cosmetics', access: 'moderator', unauthenticated: refused },
    { method: 'delete', path: '/api/cosmetics/:cosmeticId', access: 'moderator', unauthenticated: refused },

    // these answer 200 with the result of the check in the body, so an anonymous caller is told "no", not refused
    { method: 'get', path: '/api/user-is-admin', access: 'anonymous-ok', unauthenticated: served(200, { success: false, message: 'Admin privileges required' }) },
    { method: 'get', path: '/api/user-is-developer', access: 'anonymous-ok', unauthenticated: served(200, { success: false, message: 'Developer privileges required' }) },
    { method: 'get', path: '/api/user-is-moderator', access: 'anonymous-ok', unauthenticated: served(200, { success: false, message: 'Moderator privileges required' }) },

    { method: 'post', path: '/api/mod/find-user', access: 'moderator', unauthenticated: refused },
    { method: 'post', path: '/api/mod/submit-action', access: 'moderator', unauthenticated: refused },
    { method: 'post', path: '/api/mod/cancel-action', access: 'moderator', unauthenticated: refused },

    { method: 'get', path: '/api/server-settings', access: 'public', unauthenticated: served(200) },
    { method: 'post', path: '/api/mod/server-settings', access: 'admin', unauthenticated: refused },

    // development only: the local test-game tooling, and the two destructive cosmetics routes
    { method: 'get', path: '/api/test-game-setups', access: 'public', devOnly: true, unauthenticated: served(200) },
    { method: 'post', path: '/api/start-test-game', access: 'public', devOnly: true, unauthenticated: served() },
    { method: 'delete', path: '/api/cosmetics', access: 'admin', devOnly: true, unauthenticated: refused },
    { method: 'post', path: '/api/cosmetics-reset', access: 'admin', devOnly: true, unauthenticated: refused },
];

/** The row's route as a request path: `:parameters` filled in with `params`, which default to placeholders. */
export function concretePath(row: IRouteAuthRow, params: { userId?: string } = {}): string {
    return row.path
        .replace(':userId', params.userId ?? 'someone')
        .replace(':deckId', 'deck-1')
        .replace(':lobbyId', 'lobby-1')
        .replace(':cosmeticId', 'cosmetic-1');
}

/** A route as it is reported in a failure message, e.g. `GET /api/health`. */
export function describeRoute(route: { method: RouteMethod; path: string }): string {
    return `${route.method.toUpperCase()} ${route.path}`;
}
