import { CardPool, GamesToWinMode, SwuGameFormat } from '../../../../server/game/core/Constants';
import { premierBestOfOne } from '../../../helpers/server/MatchConfigs';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';

/**
 * The lobby routes over HTTP: creating a custom lobby, listing the open ones, and joining one. These were the suite's
 * first specs; they assert on the API's responses rather than on the server's internal maps. Where a socket connects is
 * covered by `SocketConnectionRouting`, and a lobby's life after that by `LobbyLifecycle`.
 */
describe('GameServer lobby API', function () {
    serverIntegration(function (contextRef) {
        let harness: ServerTestHarness;
        beforeEach(function () {
            harness = contextRef.harness;
        });

        function createLobbyBody(overrides: Record<string, unknown> = {}) {
            return {
                user: harness.anonymousUser(),
                deck: harness.decklists.validDecklist(),
                lobbyName: harness.uniqueLobbyName(),
                ...premierBestOfOne,
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

                // each owner connects, as a real one does, so the lobby is open for others to find
                for (const lobbyName of lobbyNames) {
                    await harness.openLobbyAsync({}, { lobbyName });
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
        });

        describe('GET /api/available-lobbies', function () {
            it('advertises a newly created public lobby with its configuration and host', async function () {
                const lobbyName = harness.uniqueLobbyName();
                await harness.openLobbyAsync({}, { lobbyName });

                const response = await harness.api.get('/api/available-lobbies');
                expect(response.status).toBe(200);

                const lobby = response.body.find((entry) => entry.name === lobbyName);
                expect(lobby).toBeDefined();
                expect(lobby.format).toBe(SwuGameFormat.Premier);
                expect(lobby.cardPool).toBe(CardPool.Current);
                expect(lobby.gamesToWinMode).toBe(GamesToWinMode.BestOfOne);
                expect(lobby.host).not.toBeNull();
            });

            // TODO: add a spec for how a lobby whose owner has not connected is listed and cleaned up, once
            // Open finding #1 in long-term-project-docs/game-node-test-suite.md is fixed.

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

            it('refuses a lobby whose two seats are taken', async function () {
                const { lobbyId } = await harness.createLobbyWithGuestAsync();
                const latecomer = harness.createClient();

                const response = await latecomer.joinLobbyAsync(lobbyId);

                expect(response.status).toBe(400);
                expect(response.body).toEqual({ success: false, message: 'Lobby is full' });
            });
        });
    });
});
