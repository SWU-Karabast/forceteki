/* global describe, it, expect, jasmine */
import { save } from '../../../server/game/core/stateSerialization/MatchSerializer';
import { MatchLoadError } from '../../../server/game/core/stateSerialization/MatchLoadError';
import type { ISavedMatch } from '../../../server/game/core/stateSerialization/SavedMatchInterfaces';

// GameServer.ts transitively requires server/env.ts, whose top-level zod parse throws unless these are
// set -- normally supplied by a real .env, which no other spec needs since nothing else imports
// GameServer. Set before the (deliberately delayed, non-ES) require below so the parse succeeds; ??=
// leaves a real value from an actual .env untouched.
process.env.GAME_NODE_HOST ??= 'localhost';
process.env.GAME_NODE_NAME ??= 'test-node';
process.env.GAME_NODE_SOCKET_IO_PORT ??= '9500';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GameServer } = require('../../../server/gamenode/GameServer');

/**
 * Whitebox coverage of `GameServer`'s dev-only saved-match load surface (P2-D). No `GameServer`-route-level
 * HTTP/Express test harness exists anywhere in this suite (constructing a real `GameServer` opens sockets
 * and DynamoDB connections), so `loadSavedMatchForDev`/`resolveRealUserForDevLoad` -- factored out
 * specifically to be testable without one -- are called `.call(stub, ...)`-bound to a plain object
 * providing only the fields they actually read, following the same whitebox pattern as
 * `LobbySaveReportDrain.spec.ts`.
 */
describe('GameServer dev-only saved-match load', function() {
    const loadSavedMatchForDev = (GameServer.prototype as any).loadSavedMatchForDev;
    const resolveRealUserForDevLoad = (GameServer.prototype as any).resolveRealUserForDevLoad;

    function buildServerStub(overrides: Record<string, unknown> = {}) {
        return {
            cardDataGetter: null,
            deckValidator: null,
            discordDispatcher: {},
            lobbies: new Map(),
            userLobbyMap: new Map(),
            // loadSavedMatchForDev calls this.resolveRealUserForDevLoad(...) internally; bind the real
            // prototype method onto the stub so that call resolves (and is exercised, not re-stubbed).
            resolveRealUserForDevLoad,
            userFactory: { getExistingUserByIdAsync: () => Promise.resolve(null) },
            ...overrides,
        };
    }

    it('resolveRealUserForDevLoad rejects with MatchLoadError for an id with no existing account', async function() {
        const stub = buildServerStub();
        await expectAsync(resolveRealUserForDevLoad.call(stub, 'ghost-id')).toBeRejectedWithError(MatchLoadError);
    });

    it('resolveRealUserForDevLoad resolves to the real User instance UserFactory found -- never createAnonymousUser', async function() {
        const fakeUser = { getId: () => 'u1', getUsername: () => 'Alice' };
        const stub = buildServerStub({ userFactory: { getExistingUserByIdAsync: () => Promise.resolve(fakeUser) } });

        await expectAsync(resolveRealUserForDevLoad.call(stub, 'u1')).toBeResolvedTo(fakeUser as any);
    });

    it('loadSavedMatchForDev leaves lobbies/userLobbyMap untouched when the document is malformed (P2D-R0-09a)', async function() {
        const fakeUser = { getId: () => 'p1', getUsername: () => 'Alice' };
        const stub = buildServerStub({ userFactory: { getExistingUserByIdAsync: () => Promise.resolve(fakeUser) } });

        await expectAsync(loadSavedMatchForDev.call(stub, {} as unknown as ISavedMatch, { p1: 'p1' })).toBeRejected();

        expect(stub.lobbies.size).toBe(0);
        expect(stub.userLobbyMap.size).toBe(0);
    });

    it('loadSavedMatchForDev rejects when a seat id does not resolve to a real account, and registers nothing (P2D-R0-09b)', async function() {
        const stub = buildServerStub({ userFactory: { getExistingUserByIdAsync: () => Promise.resolve(null) } });

        await expectAsync(loadSavedMatchForDev.call(stub, {} as unknown as ISavedMatch, { p1: 'ghost-id' })).toBeRejectedWithError(MatchLoadError);

        expect(stub.lobbies.size).toBe(0);
        expect(stub.userLobbyMap.size).toBe(0);
    });

    it('the load-saved-match route respects the server-wide gamesEnabled gate, the same way normal game creation does (P2D-I1-05)', async function() {
        // setupDevAppRoutes registers its routes against whatever `app`-shaped object it's given;
        // capture the handler it registers for this path instead of standing up a real Express app or
        // going through buildAuthMiddleware, per the review's named resolution.
        const registeredHandlers: Record<string, (req: unknown, res: unknown, next: unknown) => unknown> = {};
        const fakeApp = {
            post: (path: string, _auth: unknown, handler: (req: unknown, res: unknown, next: unknown) => unknown) => {
                registeredHandlers[path] = handler;
            },
            delete: (path: string, _auth: unknown, handler: (req: unknown, res: unknown, next: unknown) => unknown) => {
                registeredHandlers[path] = handler;
            },
        };
        const stub = {
            areGamesEnabled: () => false,
            getMaintenanceMessage: () => 'Karabast is currently under maintenance. Be back soon!',
            sendGamesDisabledResponse: (GameServer.prototype as any).sendGamesDisabledResponse,
            buildAuthMiddleware: () => (req: unknown, res: unknown, next: () => void) => next(),
            cosmeticsService: null,
        };

        (GameServer.prototype as any).setupDevAppRoutes.call(stub, fakeApp);
        const handler = registeredHandlers['/api/dev/load-saved-match'];
        expect(handler).toBeDefined();

        const res = {
            statusCode: undefined as number | undefined,
            body: undefined as unknown,
            status(code: number) {
                this.statusCode = code;
                return this;
            },
            json(body: unknown) {
                this.body = body;
                return this;
            },
        };
        await handler({ body: { savedMatch: {}, seats: { p1: 'u1' } } }, res, () => { /* no-op next */ });

        expect(res.statusCode).toBe(503);
        expect(res.body).toEqual(jasmine.objectContaining({ success: false }));
    });

    integration(function(contextRef) {
        it('a successful load registers the lobby, returns {success, gameId, engineOnlyFacts} and no other top-level key, and never leaks rng.seed', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { groundArena: ['battlefield-marine'] },
            });
            const { context } = contextRef;
            const document = save(context.game);

            const usersById: Record<string, { getId: () => string; getUsername: () => string }> = {
                [context.player1Object.id]: { getId: () => context.player1Object.id, getUsername: () => context.player1Object.name },
                [context.player2Object.id]: { getId: () => context.player2Object.id, getUsername: () => context.player2Object.name },
            };
            const stub = buildServerStub({
                cardDataGetter: context.game.cardDataGetter,
                userFactory: { getExistingUserByIdAsync: (id: string) => Promise.resolve(usersById[id] ?? null) },
            });

            const result = await loadSavedMatchForDev.call(stub, document, {
                p1: context.player1Object.id,
                p2: context.player2Object.id,
            });

            expect(Object.keys(result).sort()).toEqual(['engineOnlyFacts', 'gameId']);
            expect(JSON.stringify(result)).not.toContain(document.rng.seed);

            expect(stub.lobbies.size).toBe(1);
            expect(stub.userLobbyMap.size).toBe(2);
        });
    });
});
