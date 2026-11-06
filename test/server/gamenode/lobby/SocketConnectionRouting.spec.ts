import { Lobby } from '../../../../server/gamenode/Lobby';
import { premierBestOfThree } from '../../../helpers/server/MatchConfigs';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { ITestClientOptions } from '../../../helpers/server/TestClient';

const loggedIn: ITestClientOptions = { authenticated: true };

/**
 * Where a newly connected socket is sent (`GameServer.onConnectionAsync`), and what a socket the server cannot
 * place is told. A socket goes to the lobby the server has its user down for, or the lobby its link names, or
 * the queue; one that fits none of them is refused. The refactor-readiness checklist names each branch (C-rows).
 */
describe('Socket connection routing', function () {
    serverIntegration(function (contextRef) {
        describe('the handshake', function () {
            it('refuses an anonymous socket whose user query is not JSON', async function () {
                const client = contextRef.harness.createClient();

                const result = await client.attemptConnectAsync({ user: '{not json' });

                expect(result).toEqual({ connected: false, errorMessage: 'Authentication error' });
            });
        });

        describe('a user the server has down for a lobby', function () {
            it('disconnects a registered spectator who connects as a player', async function () {
                const { harness } = contextRef;
                const { lobbyId } = await harness.startLiveGameAsync();
                const spectator = harness.createClient(loggedIn);
                expect((await spectator.spectateGameAsync(lobbyId)).status).toBe(200);

                await spectator.connectAsync();

                expect(spectator.isConnected).toBeFalse();
                expect(spectator.lobbyState).toBeUndefined();
                expect(spectator.gameState).toBeUndefined();
            });

            it('tells a joiner whose lobby has closed that it no longer exists, and forgets the seat', async function () {
                const { harness } = contextRef;
                const owner = await harness.openLobbyAsync();
                const joiner = harness.createClient();
                expect((await joiner.joinLobbyAsync(owner.lobbyId)).status).toBe(200);

                // the owner leaves before the joiner's socket arrives, which empties the lobby and removes it
                await owner.manualDisconnectAsync();
                await joiner.connectAsync();

                expect(joiner.connectionErrors).toEqual(['Lobby does not exist']);
                expect(joiner.isConnected).toBeFalse();
                expect(await joiner.hasNoPlaceAsync()).withContext('the seat is forgotten')
                    .toBeTrue();
            });

            it('tells the second of two joiners who raced for the last seat that the lobby is full', async function () {
                const { harness } = contextRef;
                const owner = await harness.openLobbyAsync();
                const first = harness.createClient();
                const second = harness.createClient();

                // seats are taken when a socket connects, so both joiners pass the HTTP check
                expect((await first.joinLobbyAsync(owner.lobbyId)).status).toBe(200);
                expect((await second.joinLobbyAsync(owner.lobbyId)).status).toBe(200);
                await first.connectAsync();
                await second.connectAsync();

                expect(second.connectionErrors).toEqual(['Lobby is full']);
                expect(owner.lobbyState.users.map((user: { id: string }) => user.id)).toEqual([owner.id, first.id]);
                expect(await second.hasNoPlaceAsync()).withContext('the seat is forgotten')
                    .toBeTrue();
            });

            it('tells a player whose seat could not be set up, and disconnects them', async function () {
                const { harness } = contextRef;
                const owner = await harness.openLobbyAsync();
                const joiner = harness.createClient();
                expect((await joiner.joinLobbyAsync(owner.lobbyId)).status).toBe(200);
                spyOn(Lobby.prototype, 'addLobbyUserAsync').and.rejectWith(new Error('seat set-up failed'));

                await joiner.connectAsync();

                expect(joiner.connectionErrors).toEqual(['Error connecting to lobby']);
                expect(joiner.isConnected).toBeFalse();
                expect(await joiner.hasNoPlaceAsync()).withContext('the seat is forgotten')
                    .toBeTrue();
            });
        });

        describe('a socket carrying a lobby link', function () {
            it('is disconnected, and told nothing, when the lobby does not exist', async function () {
                const client = contextRef.harness.createClient();

                await client.connectAsync({ lobbyId: 'no-such-lobby' });

                expect(client.isConnected).toBeFalse();
                expect(client.receivedEvents()).toEqual([]);
            });

            it('is disconnected, and told nothing, when the lobby is full', async function () {
                const { harness } = contextRef;
                const { owner, guest, lobbyId } = await harness.createLobbyWithGuestAsync({}, {}, { isPrivate: true });
                const latecomer = harness.createClient();

                await latecomer.connectAsync({ lobbyId });

                expect(latecomer.isConnected).toBeFalse();
                expect(latecomer.receivedEvents()).toEqual([]);
                expect(owner.lobbyState.users.map((user: { id: string }) => user.id)).toEqual([owner.id, guest.id]);
            });

            it('is disconnected, and told nothing, when the lobby\'s game has started, even with a seat free', async function () {
                const { harness } = contextRef;
                const { guest, lobbyId } = await harness.startLiveGameAsync({}, {}, { isPrivate: true });
                await guest.manualDisconnectAsync();
                const latecomer = harness.createClient();

                await latecomer.connectAsync({ lobbyId });

                expect(latecomer.isConnected).toBeFalse();
                expect(latecomer.receivedEvents()).toEqual([]);
                expect(await latecomer.hasNoPlaceAsync()).withContext('the link gave no seat')
                    .toBeTrue();
            });

            it('takes a user the server has down for another lobby back to that lobby, ignoring the link', async function () {
                const { harness } = contextRef;
                const { owner, lobbyId } = await harness.createLobbyWithGuestAsync();
                const otherLobby = await harness.openLobbyAsync();

                await owner.connectAsync({ lobbyId: otherLobby.lobbyId });

                expect(owner.lobbyId).toBe(lobbyId);
                expect(otherLobby.lobbyState.users.map((user: { id: string }) => user.id)).toEqual([otherLobby.id]);
            });

            it('tells an anonymous user they must log in to join a public best-of-three lobby, and disconnects them', async function () {
                const { harness } = contextRef;
                const owner = await harness.openLobbyAsync(loggedIn, { config: premierBestOfThree });
                const anonymous = harness.createClient();

                await anonymous.connectAsync({ lobbyId: owner.lobbyId });

                expect(anonymous.connectionErrors).toEqual(['You must be logged in to join a public best of three lobby']);
                expect(anonymous.isConnected).toBeFalse();
                expect(owner.lobbyState.users.map((user: { id: string }) => user.id)).toEqual([owner.id]);
            });
        });
    });
});
