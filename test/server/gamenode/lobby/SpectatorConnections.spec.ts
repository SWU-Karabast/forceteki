import { RematchMode } from '../../../../server/game/core/Constants';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';
import type { ITestClientOptions, TestClient } from '../../../helpers/server/TestClient';

const loggedIn: ITestClientOptions = { authenticated: true };

/**
 * The spectator branch of the socket path (`GameServer.onConnectionAsync`). A spectator registers over HTTP
 * (`spectate-game`, whose rules `GameServerAnonymousRestrictions` covers) while a game is running, then
 * connects with the spectator flag; these are the refactor-readiness checklist's rows C4 to C8.
 */
describe('Spectator connections', function () {
    /** A logged-in user registered to spectate the game in `lobbyId`. */
    async function registeredSpectatorAsync(harness: ServerTestHarness, lobbyId: string): Promise<TestClient> {
        const spectator = harness.createClient(loggedIn);
        const response = await spectator.spectateGameAsync(lobbyId);
        expect(response.status).withContext(JSON.stringify(response.body))
            .toBe(200);
        return spectator;
    }

    serverIntegration(function (contextRef) {
        it('admits a registered spectator, who is sent the game in progress', async function () {
            const { harness } = contextRef;
            const { lobbyId } = await harness.startLiveGameAsync();
            const spectator = await registeredSpectatorAsync(harness, lobbyId);

            await spectator.connectAsync({ spectator: true });

            expect(spectator.isConnected).toBeTrue();
            expect(spectator.gameState).toBeDefined();
        });

        it('moves a spectator to a second tab, disconnecting the first', async function () {
            const { harness } = contextRef;
            const { lobbyId } = await harness.startLiveGameAsync();
            const spectator = await registeredSpectatorAsync(harness, lobbyId);
            await spectator.connectAsync({ spectator: true });

            await spectator.connectAsync({ spectator: true });

            expect(spectator.previousSocket.connected).toBeFalse();
            expect(spectator.isConnected).toBeTrue();
            expect(spectator.gameState).toBeDefined();
        });

        it('disconnects an anonymous socket asking to spectate', async function () {
            const { harness } = contextRef;
            await harness.startLiveGameAsync();
            const anonymous = harness.createClient();

            await anonymous.connectAsync({ spectator: true });

            expect(anonymous.isConnected).toBeFalse();
            expect(anonymous.receivedEvents()).toEqual([]);
        });

        it('disconnects a socket asking to spectate when its user has not registered as a spectator', async function () {
            const { harness } = contextRef;
            await harness.startLiveGameAsync();
            const unregistered = harness.createClient(loggedIn);

            await unregistered.connectAsync({ spectator: true });

            expect(unregistered.isConnected).toBeFalse();
            expect(unregistered.receivedEvents()).toEqual([]);
        });

        it('disconnects a registered spectator whose game has gone, and forgets the registration', async function () {
            const { harness } = contextRef;
            const { owner, guest, lobbyId } = await harness.startLiveGameAsync();
            const spectator = await registeredSpectatorAsync(harness, lobbyId);

            // both players leave, which empties the lobby and removes it
            await guest.manualDisconnectAsync();
            await owner.manualDisconnectAsync();
            await spectator.connectAsync({ spectator: true });

            expect(spectator.isConnected).toBeFalse();
            expect(spectator.gameState).toBeUndefined();
            expect(await spectator.hasNoPlaceAsync()).withContext('the registration is forgotten')
                .toBeTrue();
        });

        it('disconnects a registered spectator once the lobby stops allowing spectators, and forgets the registration', async function () {
            const { harness } = contextRef;
            const { owner, lobbyId } = await harness.startLiveGameAsync({}, {}, { isPrivate: true });
            await owner.updateSettingAsync('allowSpectators', true);
            const spectator = await registeredSpectatorAsync(harness, lobbyId);

            await owner.updateSettingAsync('allowSpectators', false);
            await spectator.connectAsync({ spectator: true });

            expect(spectator.isConnected).toBeFalse();
            expect(spectator.gameState).toBeUndefined();
            expect(await spectator.hasNoPlaceAsync()).withContext('the registration is forgotten')
                .toBeTrue();
        });

        it('refuses to register a spectator who is still playing in a lobby', async function () {
            const { harness } = contextRef;
            const { lobbyId } = await harness.startLiveGameAsync();
            const { owner: player } = await harness.createLobbyWithGuestAsync(loggedIn);

            const response = await player.spectateGameAsync(lobbyId);

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ success: false, message: 'User is already in a game' });
        });

        it('keeps an admitted spectator up to date as the game goes on', async function () {
            const { harness } = contextRef;
            const { owner, guest, lobbyId } = await harness.startLiveGameAsync();
            const spectator = await registeredSpectatorAsync(harness, lobbyId);
            await spectator.connectAsync({ spectator: true });

            await guest.concedeAsync();

            expect(spectator.gameState.winners).toEqual([owner.username]);
        });

        it('admits a spectator between the games of a rematch, sending them the lobby', async function () {
            const { harness } = contextRef;
            const { owner, guest, lobbyId } = await harness.startLiveGameAsync();
            await guest.concedeAsync();
            await owner.requestRematchAsync(RematchMode.Regular);
            await guest.rematchAsync();
            const spectator = await registeredSpectatorAsync(harness, lobbyId);

            await spectator.connectAsync({ spectator: true });

            expect(spectator.isConnected).toBeTrue();
            expect(spectator.lobbyState?.id).toBe(lobbyId);
            expect(spectator.gameState).toBeUndefined();
        });

        describe('in the players\' lobby state', function () {
            /** The ids of the spectators the lobby lists, as of a fresh lobby state for `player`. */
            async function listedSpectatorsAsync(player: TestClient): Promise<string[]> {
                // any lobby command makes the lobby send its state again
                await player.typingStateAsync(false);
                return player.lobbyState.spectators.map((spectator: { id: string }) => spectator.id);
            }

            it('lists an admitted spectator, and stops listing them when they leave', async function () {
                const { harness } = contextRef;
                const { owner, lobbyId } = await harness.startLiveGameAsync();
                const spectator = await registeredSpectatorAsync(harness, lobbyId);
                await spectator.connectAsync({ spectator: true });
                const listedWhileWatching = await listedSpectatorsAsync(owner);

                await spectator.manualDisconnectAsync();

                expect(listedWhileWatching).toEqual([spectator.id]);
                expect(owner.lobbyState.spectators).toEqual([]);
            });

            it('lists a spectator under their username', async function () {
                const { harness } = contextRef;
                const { owner, lobbyId } = await harness.startLiveGameAsync();
                const spectator = await registeredSpectatorAsync(harness, lobbyId);
                await spectator.connectAsync({ spectator: true });

                await listedSpectatorsAsync(owner);

                expect(owner.lobbyState.spectators).toEqual([{ id: spectator.id, username: spectator.username }]);
            });

            it('keeps listing a spectator who drops and comes back inside the grace window', async function () {
                const { harness } = contextRef;
                const { owner, lobbyId } = await harness.startLiveGameAsync();
                const spectator = await registeredSpectatorAsync(harness, lobbyId);
                await spectator.connectAsync({ spectator: true });

                await spectator.disconnectTransportAsync();
                await harness.clock.advanceAsync(10_000);
                await spectator.connectAsync({ spectator: true });
                await harness.clock.advanceAsync(20_000);

                expect(await listedSpectatorsAsync(owner)).toEqual([spectator.id]);
            });

            it('stops listing a spectator who drops and stays away past the grace window', async function () {
                const { harness } = contextRef;
                const { owner, lobbyId } = await harness.startLiveGameAsync();
                const spectator = await registeredSpectatorAsync(harness, lobbyId);
                await spectator.connectAsync({ spectator: true });

                await spectator.disconnectTransportAsync();
                await harness.clock.advanceAsync(20_000 - 1);
                const listedJustBefore = await listedSpectatorsAsync(owner);
                await harness.clock.advanceAsync(1);

                expect(listedJustBefore).toEqual([spectator.id]);
                expect(owner.lobbyState.spectators).toEqual([]);
            });
        });
    });
});
