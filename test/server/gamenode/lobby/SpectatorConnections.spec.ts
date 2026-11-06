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
            expect(harness.server.getUserLobbyId(spectator.id)).toBeUndefined();
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
            expect(harness.server.getUserLobbyId(spectator.id)).toBeUndefined();
        });
    });
});
