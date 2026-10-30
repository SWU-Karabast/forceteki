import { premierBestOfOne, premierBestOfThree } from '../../../helpers/server/MatchConfigs';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';

describe('Completed match sessions', function () {
    serverIntegration(function (contextRef) {
        for (const leavingWinner of [false, true]) {
            it(`lets the ${leavingWinner ? 'winner' : 'loser'} queue immediately with the result screen still connected`, async function () {
                const { harness } = contextRef;
                const { first, second } = await harness.startQuickGameAsync();
                await first.sendGameMessageAsync('concede');
                const player = leavingWinner ? second : first;
                const opponent = leavingWinner ? first : second;
                const oldSocket = player.socket;

                const response = await player.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });

                expect(response.status).toBe(200);
                expect(player.isConnected).toBeFalse();
                expect(opponent.isConnected).toBeTrue();
                expect(opponent.lobbyState.users.map((user) => user.id)).not.toContain(player.id);
                expect(opponent.gameState.winners).toEqual([second.username]);

                await player.connectAsync();
                const newcomer = harness.createClient();
                await newcomer.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });
                await newcomer.connectAsync();
                const newLobbyId = player.lobbyState.id;

                await oldSocket.simulateClientEmit('disconnect');
                await harness.clock.advanceAsync(21_000);

                expect(player.isConnected).toBeTrue();
                expect(player.lobbyState.id).toBe(newLobbyId);
                expect(player.gameState.winners).toEqual([]);
                expect(harness.server.testLobbyFor(player.id)?.id).toBe(newLobbyId);
            });
        }

        it('allows a new lobby after returning to a finished game 30 minutes later', async function () {
            const { harness } = contextRef;
            const { first: player } = await harness.startQuickGameAsync();
            await player.sendGameMessageAsync('concede');
            await harness.clock.advanceAsync(30 * 60_000);
            // Reconnecting the old tab refreshes its activity even though the game is over.
            await player.connectAsync();

            const response = await player.createLobbyAsync({
                lobbyName: harness.uniqueLobbyName(),
                deck: harness.decklists.validDecklist(),
                ...premierBestOfOne,
            });

            expect(response.status).toBe(200);
            expect(player.isConnected).toBeFalse();
            await player.connectAsync();
            expect(player.lobbyState.users.map((user) => user.id)).toEqual([player.id]);
        });

        it('still blocks a player in an active game', async function () {
            const { harness } = contextRef;
            const { first: player } = await harness.startQuickGameAsync();

            const response = await player.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });

            expect(response.status).toBe(403);
            expect(player.isConnected).toBeTrue();
        });

        it('still blocks a player between games of an unfinished best-of-three set', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync({ authenticated: true }, { authenticated: true }, premierBestOfThree);
            await player.sendGameMessageAsync('concede');

            let response = await player.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });
            expect(response.status).toBe(403);
            expect(player.isConnected).toBeTrue();

            await player.sendLobbyMessageAsync('proceedToNextBo3Game');
            await opponent.sendLobbyMessageAsync('proceedToNextBo3Game');
            response = await player.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });
            expect(response.status).toBe(403);
        });

        it('allows a new queue after a best-of-three set is conceded', async function () {
            const { harness } = contextRef;
            const { first: player } = await harness.startQuickGameAsync({ authenticated: true }, { authenticated: true }, premierBestOfThree);
            await player.sendLobbyMessageAsync('concedeBo3');

            const response = await player.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });

            expect(response.status).toBe(200);
            expect(player.isConnected).toBeFalse();
        });

        it('allows a new queue after a player wins two games', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync({ authenticated: true }, { authenticated: true }, premierBestOfThree);
            await player.sendGameMessageAsync('concede');
            await player.sendLobbyMessageAsync('proceedToNextBo3Game');
            await opponent.sendLobbyMessageAsync('proceedToNextBo3Game');
            await player.sendLobbyMessageAsync('setReadyStatus', true);
            await opponent.sendLobbyMessageAsync('setReadyStatus', true);
            await player.sendGameMessageAsync('concede');
            expect(player.lobbyState.winHistory.setEndResult?.endedReason).toBe('wonTwoGames');

            const response = await player.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });

            expect(response.status).toBe(200);
            expect(player.isConnected).toBeFalse();
        });
    });
});
