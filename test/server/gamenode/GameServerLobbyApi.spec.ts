import { CardPool, GamesToWinMode, SwuGameFormat } from '../../../server/game/core/Constants';
import { ServerTestHarness } from '../../helpers/server/ServerTestHarness';
import { AnonymousUser } from '../../../server/utils/user/User';

/**
 * Phase 0 vertical slice for the gamenode test suite.
 *
 * These specs prove the foundation the rest of the suite is built on: a `GameServer` can be stood up
 * in-process on a port it owns, without needing AWS credentials or the deployed card data, its API
 * can be driven over HTTP, and it can be torn down cleanly. The assertions deliberately stay on
 * observable API behaviour rather than the server's internal maps.
 */
describe('GameServer lobby API', function () {
    let harness: ServerTestHarness;

    beforeEach(async function () {
        harness = await ServerTestHarness.createAsync();
    });

    afterEach(async function () {
        await harness.shutdownAsync();
    });

    function createLobbyBody(overrides: Record<string, unknown> = {}) {
        return {
            user: harness.anonymousUser(),
            deck: harness.decklists.validDecklist(),
            lobbyName: harness.uniqueLobbyName(),
            format: SwuGameFormat.Premier,
            cardPool: CardPool.Current,
            gamesToWinMode: GamesToWinMode.BestOfOne,
            isPrivate: false,
            ...overrides,
        };
    }

    describe('POST /api/create-lobby', function () {
        it('creates a lobby for an anonymous user with a valid deck', async function () {
            const response = await harness.api
                .post('/api/create-lobby')
                .send(createLobbyBody());

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('uses distinct deterministic lobby names even when random text would fail profanity validation', async function () {
            spyOn(Math, 'random').and.returnValue(Number.parseInt('fat22a', 36) / (36 ** 6));
            const lobbyNames = [harness.uniqueLobbyName(), harness.uniqueLobbyName()];

            expect(lobbyNames).toEqual(['test-lobby-1', 'test-lobby-2']);

            for (const lobbyName of lobbyNames) {
                const response = await harness.api
                    .post('/api/create-lobby')
                    .send(createLobbyBody({ lobbyName }));

                expect(response.status).withContext(JSON.stringify(response.body))
                    .toBe(200);
                expect(response.body.success).toBe(true);
            }

            const response = await harness.api.get('/api/available-lobbies');

            expect(response.status).toBe(200);
            expect(response.body.map((lobby) => lobby.name).sort()).toEqual(lobbyNames);
        });

        it('rejects a deck that is too small to be legal', async function () {
            const response = await harness.api
                .post('/api/create-lobby')
                .send(createLobbyBody({ deck: harness.decklists.undersizedDecklist() }));

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        it('rejects an unrecognised game format', async function () {
            const response = await harness.api
                .post('/api/create-lobby')
                .send(createLobbyBody({ format: 'not-a-real-format' }));

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('refuses to let a user create a second lobby while already in one', async function () {
            const user = harness.anonymousUser();

            const first = await harness.api
                .post('/api/create-lobby')
                .send(createLobbyBody({ user }));
            expect(first.status).toBe(200);

            const second = await harness.api
                .post('/api/create-lobby')
                .send(createLobbyBody({ user }));

            expect(second.status).toBe(403);
            expect(second.body.success).toBe(false);
        });

        describe('after the user closed the tab of their previous lobby', function () {
            /**
             * Does what the server does when the socket of a lobby user disconnects (see `Lobby.setUserDisconnected`).
             * The harness can't open sockets yet, so this reaches into the lobby the user is in.
             */
            function getLobbyOf(userId: string) {
                const lobbyId = harness.server['userLobbyMap'].get(userId).lobbyId;
                return harness.server['lobbies'].get(lobbyId);
            }

            function simulateTabClosed(userId: string) {
                getLobbyOf(userId).users.find((user) => user.id === userId).state = 'disconnected';
            }

            it('lets the user create a new lobby right away if nobody else was in the previous one', async function () {
                const user = harness.anonymousUser();
                const firstLobbyName = harness.uniqueLobbyName();

                const first = await harness.api
                    .post('/api/create-lobby')
                    .send(createLobbyBody({ user, lobbyName: firstLobbyName }));
                expect(first.status).toBe(200);

                simulateTabClosed(user.id);

                const second = await harness.api
                    .post('/api/create-lobby')
                    .send(createLobbyBody({ user }));

                expect(second.status).withContext(JSON.stringify(second.body))
                    .toBe(200);
                expect(second.body.success).toBe(true);

                const lobbies = await harness.api.get('/api/available-lobbies');
                expect(lobbies.body.some((lobby) => lobby.name === firstLobbyName)).toBe(false);
            });

            it('still blocks the user while another player is in the previous lobby', async function () {
                const host = harness.anonymousUser();

                const created = await harness.api
                    .post('/api/create-lobby')
                    .send(createLobbyBody({ user: host }));
                expect(created.status).toBe(200);

                // a joining player only becomes a lobby user once their socket connects, which the harness can't do yet
                const opponent = harness.anonymousUser();
                getLobbyOf(host.id).createLobbyUser(new AnonymousUser(opponent.id, opponent.username, true));

                simulateTabClosed(host.id);

                const second = await harness.api
                    .post('/api/create-lobby')
                    .send(createLobbyBody({ user: host }));

                expect(second.status).toBe(403);
                expect(second.body.success).toBe(false);
            });
        });
    });

    describe('GET /api/available-lobbies', function () {
        it('advertises a newly created public lobby with its configuration and host', async function () {
            const lobbyName = harness.uniqueLobbyName();

            const created = await harness.api
                .post('/api/create-lobby')
                .send(createLobbyBody({ lobbyName }));
            expect(created.status).toBe(200);

            const response = await harness.api.get('/api/available-lobbies');
            expect(response.status).toBe(200);

            const lobby = response.body.find((entry) => entry.name === lobbyName);
            expect(lobby).toBeDefined();
            expect(lobby.format).toBe(SwuGameFormat.Premier);
            expect(lobby.cardPool).toBe(CardPool.Current);
            expect(lobby.gamesToWinMode).toBe(GamesToWinMode.BestOfOne);
            expect(lobby.host).not.toBeNull();
        });

        // Characterises current behaviour: `createLobbyUser` marks the owner 'connected' via
        // `updateUserLastActivity` even though their socket is still null, so a lobby is advertised
        // from the moment it is created over HTTP. That covers the gap while the client navigates,
        // but it also means a lobby whose owner never connects stays listed as joinable.
        it('advertises a lobby whose owner has not connected a socket', async function () {
            const lobbyName = harness.uniqueLobbyName();

            await harness.api
                .post('/api/create-lobby')
                .send(createLobbyBody({ lobbyName }));

            const response = await harness.api.get('/api/available-lobbies');

            expect(response.body.some((lobby) => lobby.name === lobbyName)).toBe(true);
        });

        it('does not advertise a private lobby', async function () {
            const lobbyName = harness.uniqueLobbyName();

            const created = await harness.api
                .post('/api/create-lobby')
                .send(createLobbyBody({ lobbyName, isPrivate: true }));
            expect(created.status).toBe(200);

            const response = await harness.api.get('/api/available-lobbies');

            expect(response.body.some((lobby) => lobby.name === lobbyName)).toBe(false);
        });
    });

    describe('POST /api/join-lobby', function () {
        it('returns 404 for a lobby that does not exist', async function () {
            const response = await harness.api
                .post('/api/join-lobby')
                .send({ lobbyId: 'no-such-lobby', user: harness.anonymousUser() });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });
});
