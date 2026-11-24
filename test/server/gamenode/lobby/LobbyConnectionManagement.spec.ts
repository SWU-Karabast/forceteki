import { premierBestOfOne } from '../../../helpers/server/MatchConfigs';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';

/**
 * A player reaching a custom lobby and their connection coming and going before the game: the two ways a real user
 * reaches a lobby (browsing `/api/available-lobbies` and joining, or following a private lobby's link), leaving, an abrupt
 * drop either side of the 20-second grace window, and a reconnect replacing the socket. The refactor-readiness
 * checklist's rows C13 (in a lobby), C18, D1, D2 and D3. The same during a game is in `InGameConnections`; where a socket
 * the server cannot place is sent is in `SocketConnectionRouting`.
 */
describe('Lobby connection management', function () {
    serverIntegration(function (contextRef) {
        describe('a public lobby', function () {
            it('lets a second user discover and join it via /api/available-lobbies', async function () {
                const { harness } = contextRef;
                const owner = harness.createClient();
                const joiner = harness.createClient();
                const lobbyName = harness.uniqueLobbyName();

                const created = await owner.createLobbyAsync({
                    lobbyName,
                    deck: harness.decklists.validDecklist(),
                    ...premierBestOfOne,
                });
                expect(created.status).toBe(200);

                await owner.connectAsync();
                expect(owner.lobbyState.users.map((u: any) => u.username)).toEqual([owner.username]);

                const discovered = await joiner.findAvailableLobbyAsync((lobby) => lobby.name === lobbyName);
                expect(discovered).toBeDefined();

                const joined = await joiner.joinLobbyAsync(discovered.id);
                expect(joined.status).toBe(200);

                await joiner.connectAsync();

                for (const client of [owner, joiner]) {
                    const usernames = client.lobbyState.users.map((u: any) => u.username).sort();
                    expect(usernames).toEqual([joiner.username, owner.username].sort());
                }
            });

            it('stops advertising the lobby once it is filled', async function () {
                const { harness } = contextRef;
                const owner = harness.createClient();
                const joiner = harness.createClient();
                const thirdUser = harness.createClient();
                const lobbyName = harness.uniqueLobbyName();

                await owner.createLobbyAsync({ lobbyName, deck: harness.decklists.validDecklist(), ...premierBestOfOne });
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
                const owner = harness.createClient();
                const joiner = harness.createClient();

                const created = await owner.createLobbyAsync({
                    lobbyName: harness.uniqueLobbyName(),
                    deck: harness.decklists.validDecklist(),
                    isPrivate: true,
                    ...premierBestOfOne,
                });
                expect(created.status).toBe(200);

                await owner.connectAsync();
                expect(owner.lobbyState.connectionLink).toBeTruthy();

                const { lobbyId } = owner;
                expect(lobbyId).toBeTruthy();

                // the real client never calls /api/join-lobby for a private lobby - it connects the
                // socket directly with the lobby id from the link, hitting onConnectionAsync's
                // "connected via link" branch rather than the "already in userLobbyMap" one
                await joiner.connectAsync({ lobbyId });

                for (const client of [owner, joiner]) {
                    const usernames = client.lobbyState.users.map((u: any) => u.username).sort();
                    expect(usernames).toEqual([joiner.username, owner.username].sort());
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
                    ...premierBestOfOne,
                });
                await owner.connectAsync();

                const discovered = await outsider.findAvailableLobbyAsync((lobby) => lobby.name === lobbyName);
                expect(discovered).toBeUndefined();
            });
        });

        describe('leaving a lobby', function () {
            it('updates the remaining user\'s lobbystate when the other user disconnects gracefully', async function () {
                const { harness } = contextRef;
                const owner = harness.createClient();
                const joiner = harness.createClient();
                const lobbyName = harness.uniqueLobbyName();

                await owner.createLobbyAsync({ lobbyName, deck: harness.decklists.validDecklist(), ...premierBestOfOne });
                await owner.connectAsync();

                const discovered = await joiner.findAvailableLobbyAsync((lobby) => lobby.name === lobbyName);
                await joiner.joinLobbyAsync(discovered.id);
                await joiner.connectAsync();

                await joiner.manualDisconnectAsync();

                expect(owner.lobbyState.users.map((u: any) => u.username)).toEqual([owner.username]);
            });
        });

        describe('an abrupt disconnect', function () {
            it('removes a user from the lobby once the grace window elapses', async function () {
                const { harness } = contextRef;
                const owner = harness.createClient();
                const joiner = harness.createClient();
                const lobbyName = harness.uniqueLobbyName();

                await owner.createLobbyAsync({ lobbyName, deck: harness.decklists.validDecklist(), ...premierBestOfOne });
                await owner.connectAsync();

                const discovered = await joiner.findAvailableLobbyAsync((lobby) => lobby.name === lobbyName);
                await joiner.joinLobbyAsync(discovered.id);
                await joiner.connectAsync();

                await joiner.disconnectTransportAsync();

                // still inside GameServer.onSocketDisconnected's default 20s grace window: not removed yet
                await harness.clock.advanceAsync(20_000 - 1);
                expect(owner.lobbyState.users.map((u: any) => u.username).sort()).toEqual([joiner.username, owner.username].sort());

                // grace window elapses
                await harness.clock.advanceAsync(1);
                expect(owner.lobbyState.users.map((u: any) => u.username)).toEqual([owner.username]);
            });

            it('keeps the seat of a user who reconnects inside the grace window', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.createLobbyWithGuestAsync();

                await guest.disconnectTransportAsync();
                await harness.clock.advanceAsync(10_000);
                await guest.connectAsync();
                await harness.clock.advanceAsync(20_000);

                expect(owner.lobbyState.users.map((user: { id: string }) => user.id)).toEqual([owner.id, guest.id]);
            });

            // Regression test for a fake-transport bug: `simulateClientEmit` used to dispatch to
            // handlers even on an already-disconnected socket. Every lobby/game message runs
            // `Lobby.updateUserLastActivity`, which unconditionally marks the user 'connected' again -
            // so a stale message could silently cancel the pending grace-window removal, and no test
            // would notice, since the lobby would just look like it hadn't removed the user *yet*.
            it('rejects a message sent on an already-disconnected socket instead of reviving the user', async function () {
                const { harness } = contextRef;
                const owner = harness.createClient();
                const joiner = harness.createClient();
                const lobbyName = harness.uniqueLobbyName();

                await owner.createLobbyAsync({ lobbyName, deck: harness.decklists.validDecklist(), ...premierBestOfOne });
                await owner.connectAsync();

                const discovered = await joiner.findAvailableLobbyAsync((lobby) => lobby.name === lobbyName);
                await joiner.joinLobbyAsync(discovered.id);
                await joiner.connectAsync();

                await joiner.disconnectTransportAsync();

                // real socket.io drops everything from a socket once it has left the namespace - a
                // message can't reach the server and revive the user's 'connected' state
                await expectAsync(joiner.sendLobbyMessageAsync('sendChatMessage', 'still here?'))
                    .toBeRejectedWithError(/already disconnected/);

                await harness.clock.advanceAsync(20 * 1000);
                expect(owner.lobbyState.users.map((u: any) => u.username)).toEqual([owner.username]);
            });
        });

        describe('reconnecting', function () {
            it('disconnects the previous socket when a user reconnects with a new one', async function () {
                const { harness } = contextRef;
                const owner = harness.createClient();
                const joiner = harness.createClient();
                const lobbyName = harness.uniqueLobbyName();

                await owner.createLobbyAsync({ lobbyName, deck: harness.decklists.validDecklist(), ...premierBestOfOne });
                await owner.connectAsync();

                const discovered = await joiner.findAvailableLobbyAsync((lobby) => lobby.name === lobbyName);
                await joiner.joinLobbyAsync(discovered.id);
                await joiner.connectAsync();

                // a page refresh (or a second tab - the same thing server-side) reconnects with a
                // brand new socket while the old one is still technically open
                await joiner.connectAsync();

                expect(joiner.previousSocket.connected).toBe(false);
                expect(joiner.socket.connected).toBe(true);
                expect(joiner.socket).not.toBe(joiner.previousSocket);
            });
        });
    });
});
