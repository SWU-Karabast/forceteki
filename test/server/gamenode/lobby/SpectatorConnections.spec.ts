import { RematchMode } from '../../../../server/game/core/Constants';
import { Lobby } from '../../../../server/gamenode/Lobby';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';
import type { ITestClientOptions, TestClient } from '../../../helpers/server/TestClient';

const loggedIn: ITestClientOptions = { authenticated: true };

/**
 * The spectator branch of the socket path (`GameServer.onConnectionAsync`). A spectator registers over HTTP
 * (`spectate-game`, whose rules `GameServerAnonymousRestrictions` covers) while a game is running, then
 * connects with the spectator flag. The refactor-readiness checklist's rows C4 to C8 and C22 (admission), and D7 and D8
 * (leaving). A lobby counts as having a game running once its first game has started, including between the games of a
 * rematch (`Lobby.hasOngoingGame`), which is why a spectator can be admitted then.
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

        it('admits a spectator between the games of a rematch, sending them the lobby and then the next game', async function () {
            const { harness } = contextRef;
            const { owner, guest, lobbyId } = await harness.startLiveGameAsync();
            await guest.concedeAsync();
            await owner.requestRematchAsync(RematchMode.Regular);
            await guest.rematchAsync();
            const spectator = await registeredSpectatorAsync(harness, lobbyId);

            await spectator.connectAsync({ spectator: true });
            const lobbyIdBetweenGames = spectator.lobbyState?.id;
            const gameBetweenGames = spectator.gameState;
            await owner.setReadyStatusAsync(true);
            await guest.setReadyStatusAsync(true);
            await owner.startGameAsync();

            expect(spectator.isConnected).toBeTrue();
            expect(lobbyIdBetweenGames).toBe(lobbyId);
            expect(gameBetweenGames).toBeUndefined();
            expect(spectator.gameState).withContext('the next game reaches the spectator')
                .toBeDefined();
        });

        describe('the spectator count', function () {
            /** The number watching, as of the latest game state `client` was sent. */
            function countInGameState(client: TestClient): number {
                return client.gameState.spectatorSummary.count;
            }

            /** How many game states `client` has been sent. */
            function gameStatesSent(client: TestClient): number {
                return client.receivedEvents('gamestate').length;
            }

            it('is sent to the players and the spectator in every game state, including the spectator\'s first', async function () {
                const { harness } = contextRef;
                const { owner, guest, lobbyId } = await harness.startLiveGameAsync();
                const spectator = await registeredSpectatorAsync(harness, lobbyId);

                await spectator.connectAsync({ spectator: true });

                expect(spectator.receivedEvents('gamestate')[0].args[0].spectatorSummary).toEqual({ count: 1 });
                expect(owner.gameState.spectatorSummary).toEqual({ count: 1 });
                expect(guest.gameState.spectatorSummary).toEqual({ count: 1 });
            });

            it('drops when a spectator drops, without waiting for the grace window, and comes back when they return inside it', async function () {
                const { harness } = contextRef;
                const { owner, lobbyId } = await harness.startLiveGameAsync();
                const spectator = await registeredSpectatorAsync(harness, lobbyId);
                await spectator.connectAsync({ spectator: true });
                await harness.clock.advanceAsync(Lobby.SpectatorSummaryPushIntervalMs);

                await spectator.disconnectTransportAsync();
                const countAfterDrop = countInGameState(owner);
                await harness.clock.advanceAsync(10_000);
                await spectator.connectAsync({ spectator: true });
                const countAfterReturn = countInGameState(owner);
                await harness.clock.advanceAsync(20_000);

                expect(countAfterDrop).toBe(0);
                expect(countAfterReturn).toBe(1);
                expect(countInGameState(owner)).withContext('past the grace window')
                    .toBe(1);
            });

            it('stays down for a spectator who drops and stays away past the grace window', async function () {
                const { harness } = contextRef;
                const { owner, lobbyId } = await harness.startLiveGameAsync();
                const spectator = await registeredSpectatorAsync(harness, lobbyId);
                await spectator.connectAsync({ spectator: true });
                await harness.clock.advanceAsync(Lobby.SpectatorSummaryPushIntervalMs);

                await spectator.disconnectTransportAsync();
                await harness.clock.advanceAsync(20_000);
                await owner.sendGameChatAsync('still there?');

                expect(countInGameState(owner)).toBe(0);
            });

            it('combines the changes from a burst of arrivals into one push at the end of the interval', async function () {
                const { harness } = contextRef;
                const { owner, lobbyId } = await harness.startLiveGameAsync();
                const spectators: TestClient[] = [];
                for (let i = 0; i < 3; i++) {
                    spectators.push(await registeredSpectatorAsync(harness, lobbyId));
                }
                const sentBefore = gameStatesSent(owner);

                await spectators[0].connectAsync({ spectator: true });
                const sentForFirstArrival = gameStatesSent(owner) - sentBefore;
                await spectators[1].connectAsync({ spectator: true });
                await spectators[2].connectAsync({ spectator: true });
                await harness.clock.advanceAsync(Lobby.SpectatorSummaryPushIntervalMs - 1);
                const sentWithinInterval = gameStatesSent(owner) - sentBefore;
                await harness.clock.advanceAsync(1);

                expect(sentForFirstArrival).withContext('the first arrival is pushed at once')
                    .toBe(1);
                expect(sentWithinInterval).withContext('later arrivals wait for the interval to end')
                    .toBe(1);
                expect(gameStatesSent(owner) - sentBefore).toBe(2);
                expect(countInGameState(owner)).toBe(3);
                expect(spectators[2].gameState.spectatorSummary).toEqual({ count: 3 });
            });

            it('is in the players\' lobby state, and drops when a spectator leaves', async function () {
                const { harness } = contextRef;
                const { owner, lobbyId } = await harness.startLiveGameAsync();
                const spectator = await registeredSpectatorAsync(harness, lobbyId);
                await spectator.connectAsync({ spectator: true });
                // any lobby command makes the lobby send its state again
                await owner.typingStateAsync(false);
                const countWhileWatching = owner.lobbyState.spectatorCount;

                await spectator.manualDisconnectAsync();
                await owner.typingStateAsync(false);

                expect(countWhileWatching).toBe(1);
                expect(owner.lobbyState.spectatorCount).toBe(0);
            });

            it('is pushed to the players in the lobby state between the games of a rematch', async function () {
                const { harness } = contextRef;
                const { owner, guest, lobbyId } = await harness.startLiveGameAsync();
                await guest.concedeAsync();
                await owner.requestRematchAsync(RematchMode.Regular);
                await guest.rematchAsync();
                const spectator = await registeredSpectatorAsync(harness, lobbyId);

                await spectator.connectAsync({ spectator: true });

                expect(owner.lobbyState.spectatorCount).toBe(1);
                expect(guest.lobbyState.spectatorCount).toBe(1);
            });
        });
    });
});
