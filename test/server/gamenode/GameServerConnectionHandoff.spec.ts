import { CardPool, GamesToWinMode, SwuGameFormat } from '../../../server/game/core/Constants';
import { serverIntegration } from '../../helpers/server/ServerIntegrationHelper';

/**
 * Phase 2 deliverable: the first full HTTP -> socket handoff tests, driven entirely through the fake
 * transport (`TestClient` + `FakeIoSocket`) rather than the server's internal maps. These exercise
 * the two ways a real user reaches a lobby - browsing `/api/available-lobbies` and joining, or
 * following a private lobby's link - exactly as `forceteki-client` does, and both of the production
 * branches `GameServer.onConnectionAsync` dispatches on for them.
 */
describe('GameServer connection handoff', function () {
    serverIntegration(function (contextRef) {
        function matchConfig() {
            return {
                format: SwuGameFormat.Premier,
                cardPool: CardPool.Current,
                gamesToWinMode: GamesToWinMode.BestOfOne,
            };
        }

        describe('a public lobby', function () {
            it('lets a second user discover and join it via /api/available-lobbies', async function () {
                const { harness } = contextRef;
                const owner = harness.createClient({ username: 'Owner' });
                const joiner = harness.createClient({ username: 'Joiner' });
                const lobbyName = harness.uniqueLobbyName();

                const created = await owner.createLobbyAsync({
                    lobbyName,
                    deck: harness.decklists.validDecklist(),
                    ...matchConfig(),
                });
                expect(created.status).toBe(200);

                await owner.connectAsync();
                expect(owner.lobbyState.users.map((u: any) => u.username)).toEqual(['Owner']);

                const discovered = await joiner.findAvailableLobbyAsync((lobby) => lobby.name === lobbyName);
                expect(discovered).toBeDefined();

                const joined = await joiner.joinLobbyAsync(discovered.id);
                expect(joined.status).toBe(200);

                await joiner.connectAsync();

                for (const client of [owner, joiner]) {
                    const usernames = client.lobbyState.users.map((u: any) => u.username).sort();
                    expect(usernames).toEqual(['Joiner', 'Owner']);
                }
            });

            it('stops advertising the lobby once it is filled', async function () {
                const { harness } = contextRef;
                const owner = harness.createClient();
                const joiner = harness.createClient();
                const thirdUser = harness.createClient();
                const lobbyName = harness.uniqueLobbyName();

                await owner.createLobbyAsync({ lobbyName, deck: harness.decklists.validDecklist(), ...matchConfig() });
                await owner.connectAsync();

                const beforeJoin = await thirdUser.findAvailableLobbyAsync((lobby) => lobby.name === lobbyName);
                expect(beforeJoin).toBeDefined();

                const discovered = await joiner.findAvailableLobbyAsync((lobby) => lobby.name === lobbyName);
                await joiner.joinLobbyAsync(discovered.id);
                await joiner.connectAsync();

                const afterJoin = await thirdUser.findAvailableLobbyAsync((lobby) => lobby.name === lobbyName);
                expect(afterJoin).toBeUndefined();
            });
        });

        describe('a private lobby', function () {
            it('lets a second user join via the connection link only, with no join-lobby HTTP call', async function () {
                const { harness } = contextRef;
                const owner = harness.createClient({ username: 'Owner' });
                const joiner = harness.createClient({ username: 'Joiner' });

                const created = await owner.createLobbyAsync({
                    lobbyName: harness.uniqueLobbyName(),
                    deck: harness.decklists.validDecklist(),
                    isPrivate: true,
                    ...matchConfig(),
                });
                expect(created.status).toBe(200);

                await owner.connectAsync();
                const { connectionLink } = owner.lobbyState;
                expect(connectionLink).toBeTruthy();

                const lobbyId = new URL(connectionLink).searchParams.get('lobbyId');
                expect(lobbyId).toBeTruthy();

                // the real client never calls /api/join-lobby for a private lobby - it connects the
                // socket directly with the lobby id from the link, hitting onConnectionAsync's
                // "connected via link" branch rather than the "already in userLobbyMap" one
                await joiner.connectAsync({ lobbyId });

                for (const client of [owner, joiner]) {
                    const usernames = client.lobbyState.users.map((u: any) => u.username).sort();
                    expect(usernames).toEqual(['Joiner', 'Owner']);
                }
            });

            it('never appears in /api/available-lobbies', async function () {
                const { harness } = contextRef;
                const owner = harness.createClient();
                const outsider = harness.createClient();
                const lobbyName = harness.uniqueLobbyName();

                await owner.createLobbyAsync({
                    lobbyName,
                    deck: harness.decklists.validDecklist(),
                    isPrivate: true,
                    ...matchConfig(),
                });
                await owner.connectAsync();

                const discovered = await outsider.findAvailableLobbyAsync((lobby) => lobby.name === lobbyName);
                expect(discovered).toBeUndefined();
            });
        });

        describe('leaving a lobby', function () {
            it('updates the remaining user\'s lobbystate when the other user disconnects gracefully', async function () {
                const { harness } = contextRef;
                const owner = harness.createClient({ username: 'Owner' });
                const joiner = harness.createClient({ username: 'Joiner' });
                const lobbyName = harness.uniqueLobbyName();

                await owner.createLobbyAsync({ lobbyName, deck: harness.decklists.validDecklist(), ...matchConfig() });
                await owner.connectAsync();

                const discovered = await joiner.findAvailableLobbyAsync((lobby) => lobby.name === lobbyName);
                await joiner.joinLobbyAsync(discovered.id);
                await joiner.connectAsync();

                await joiner.manualDisconnectAsync();

                expect(owner.lobbyState.users.map((u: any) => u.username)).toEqual(['Owner']);
            });
        });
    });
});
