import { Lobby } from '../../../../server/gamenode/Lobby';
import { premierBestOfOne } from '../../../helpers/server/MatchConfigs';
import { seedRoleHolders } from '../../../helpers/server/RoleHolders';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';
import type { TestClient } from '../../../helpers/server/TestClient';

const tickMs = 1000;
const queueGraceMs = 3000;
const matchmakingPenaltyMs = 20_000;

/**
 * The quick lobby two matched players are put in: its countdown, what happens when one of them drops during it,
 * and asking to be queued again afterwards. The refactor-readiness checklist's rows L2, D6, B2, B6 and C16.
 */
describe('Quick-lobby countdown', function () {
    /** Two players queued and connected, and so matched into a quick lobby whose countdown has just begun. */
    async function matchTwoPlayersAsync(harness: ServerTestHarness): Promise<{ first: TestClient; second: TestClient }> {
        const players = [harness.createClient(), harness.createClient()];
        for (const player of players) {
            const response = await player.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });
            expect(response.status).toBe(200);
            await player.connectAsync();
        }
        expect(players[0].lobbyState).withContext('the two players were matched')
            .toBeDefined();
        return { first: players[0], second: players[1] };
    }

    serverIntegration(function (contextRef) {
        it('counts down a second at a time to "Starts in 0", and starts the game on the next tick', async function () {
            const { harness } = contextRef;
            const { first, second } = await matchTwoPlayersAsync(harness);

            const texts: string[] = [];
            let elapsedMs = 0;
            while (!first.gameState && elapsedMs <= Lobby.QuickLobbyCountdownMs) {
                texts.push(first.lobbyState.matchingCountdownText);
                await harness.clock.advanceAsync(tickMs);
                elapsedMs += tickMs;
            }

            const startSeconds = Lobby.QuickLobbyCountdownMs / tickMs - 1;
            expect(texts).toEqual(Array.from({ length: startSeconds + 1 }, (_, i) => `Starts in ${startSeconds - i}`));
            expect(elapsedMs).toBe(Lobby.QuickLobbyCountdownMs);
            expect(second.gameState).toBeDefined();
        });

        it('waits for a player who dropped as the countdown ended, and starts the game once they are back', async function () {
            const { harness } = contextRef;
            const { first, second } = await matchTwoPlayersAsync(harness);

            await harness.clock.advanceAsync(Lobby.QuickLobbyCountdownMs - tickMs / 2);
            await second.disconnectTransportAsync();
            await harness.clock.advanceAsync(tickMs / 2);
            const textWhileAway = first.lobbyState.matchingCountdownText;
            const gameWhileAway = first.gameState;
            await harness.clock.advanceAsync(tickMs / 2);
            await second.connectAsync();
            await harness.clock.advanceAsync(tickMs / 2);

            expect(textWhileAway).toBe('Waiting for opponent to connect...');
            expect(gameWhileAway).toBeUndefined();
            expect(first.gameState).toBeDefined();
            expect(second.gameState).toBeDefined();
        });

        describe('a player who drops during the countdown and does not come back', function () {
            /** Matches two players, then drops the first and waits out the queue's grace window, which is when the penalty starts. */
            async function dropOutAsync(harness: ServerTestHarness): Promise<{ dropped: TestClient; opponent: TestClient }> {
                const { first, second } = await matchTwoPlayersAsync(harness);
                await harness.clock.advanceAsync(2 * tickMs);
                await first.disconnectTransportAsync();
                await harness.clock.advanceAsync(queueGraceMs);
                return { dropped: first, opponent: second };
            }

            it('is kept out of the queue for 20 seconds', async function () {
                const { harness } = contextRef;
                const { dropped } = await dropOutAsync(harness);

                await harness.clock.advanceAsync(matchmakingPenaltyMs - 1);
                const whilePenalised = await dropped.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });
                await harness.clock.advanceAsync(1);
                const afterwards = await dropped.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });

                expect(whilePenalised.status).toBe(403);
                expect(afterwards.status).toBe(200);
            });

            it('is kept out of new lobbies for those 20 seconds, over HTTP and by a lobby link', async function () {
                const { harness } = contextRef;
                const elsewhere = await harness.openLobbyAsync();
                const { dropped } = await dropOutAsync(harness);
                await harness.clock.advanceAsync(matchmakingPenaltyMs - 1);

                const created = await dropped.createLobbyAsync({ lobbyName: harness.uniqueLobbyName(), deck: harness.decklists.validDecklist(), ...premierBestOfOne });
                const joined = await dropped.joinLobbyAsync(elsewhere.lobbyId);
                await dropped.connectAsync({ lobbyId: elsewhere.lobbyId });

                expect(created.status).toBe(403);
                expect(joined.status).toBe(403);
                expect(dropped.isConnected).toBeFalse();
                expect(elsewhere.lobbyState.users.map((user: { id: string }) => user.id)).toEqual([elsewhere.id]);
            });

            it('sends their opponent back to the queue', async function () {
                const { harness } = contextRef;
                const { opponent } = await dropOutAsync(harness);

                await harness.clock.advanceAsync(2000);

                expect(opponent.receivedEvents('matchmakingFailed').map((event) => event.args[0])).toEqual(['Player disconnected']);
                expect(harness.server.getUserLobbyId(opponent.id)).toBeUndefined();
            });
        });
    });

    describe('asking to be queued again while games are switched off', function () {
        const roles = seedRoleHolders();

        serverIntegration(function (contextRef) {
            it('is refused, with the maintenance message, leaving the player where they were', async function () {
                const { harness } = contextRef;
                const { first: player } = await harness.startQuickGameAsync();
                await player.concedeAsync();
                const lobbyId = harness.server.getUserLobbyId(player.id);
                const admin = harness.createAccountClient(roles.accounts.admin);
                const switchedOff = await admin.requestAsync('post', '/api/mod/server-settings', { gamesEnabled: false, maintenanceMessage: 'Back at noon' });
                expect(switchedOff.status).toBe(200);

                await player.requeueAsync();

                expect(player.connectionErrors).toEqual(['Back at noon']);
                expect(harness.server.getUserLobbyId(player.id)).toBe(lobbyId);
            });
        }, { database: roles.seed });
    });
});
