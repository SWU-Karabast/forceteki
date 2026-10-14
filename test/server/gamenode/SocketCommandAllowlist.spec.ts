import { CardPool, GamesToWinMode, SwuGameFormat } from '../../../server/game/core/Constants';
import { serverIntegration } from '../../helpers/server/ServerIntegrationHelper';

const matchConfig = {
    format: SwuGameFormat.Premier,
    cardPool: CardPool.Current,
    gamesToWinMode: GamesToWinMode.BestOfOne,
};

const bestOfThreeConfig = { ...matchConfig, gamesToWinMode: GamesToWinMode.BestOfThree };

/**
 * Lobby and game socket messages name the method to call. Only the commands the client actually
 * sends may be invoked; every other method on Lobby and Game is server-internal.
 */
describe('Socket command allowlist', function () {
    serverIntegration(function (contextRef) {
        it('ignores a lobby command naming a server-internal method', async function () {
            const { harness } = contextRef;
            const owner = harness.createClient();
            const joiner = harness.createClient();
            await owner.createLobbyAsync({ lobbyName: harness.uniqueLobbyName(), deck: harness.decklists.validDecklist(), isPrivate: true, ...matchConfig });
            await owner.connectAsync();
            const lobbyId = new URL(owner.lobbyState.connectionLink).searchParams.get('lobbyId');
            await joiner.connectAsync({ lobbyId });

            // would empty the lobby's user list if it ran
            await owner.sendLobbyMessageAsync('cleanLobby');
            await joiner.sendLobbyMessageAsync('sendChatMessage', 'still here');

            expect(JSON.stringify(owner.lobbyState.gameChat.messages)).toContain('still here');
        });

        it('accepts concedeBo3, which the client sends to concede a best-of-three set', async function () {
            const { harness } = contextRef;
            const owner = harness.createClient();
            const joiner = harness.createClient();
            await owner.createLobbyAsync({ lobbyName: harness.uniqueLobbyName(), deck: harness.decklists.validDecklist(), isPrivate: true, ...bestOfThreeConfig });
            await owner.connectAsync();
            const lobbyId = new URL(owner.lobbyState.connectionLink).searchParams.get('lobbyId');
            await joiner.connectAsync({ lobbyId });

            await owner.sendLobbyMessageAsync('concedeBo3');

            expect(owner.lobbyState.winHistory.setEndResult?.endedReason).toBe('concede');
        });

        it('accepts proceedToNextBo3Game, which the client sends to start the next game of a set', async function () {
            const { harness } = contextRef;
            const [player, opponent] = [harness.createClient({ authenticated: true }), harness.createClient({ authenticated: true })];
            for (const client of [player, opponent]) {
                await client.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...bestOfThreeConfig });
                await client.connectAsync();
            }
            await harness.clock.advanceAsync(6_000);
            expect(player.gameState).toBeDefined();

            await player.sendGameMessageAsync('concede');
            await player.sendLobbyMessageAsync('proceedToNextBo3Game');
            await opponent.sendLobbyMessageAsync('proceedToNextBo3Game');

            expect(player.lobbyState.winHistory.currentGameNumber).toBe(2);
        });

        it('ignores a game command naming a server-internal method', async function () {
            const { harness } = contextRef;
            const [player, opponent] = [harness.createClient(), harness.createClient()];
            for (const client of [player, opponent]) {
                await client.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...matchConfig });
                await client.connectAsync();
            }
            await harness.clock.advanceAsync(6_000);
            expect(player.gameState).toBeDefined();

            // would add to an arbitrary field on the player and log "sets allowlistProbe to ..." if it ran
            await player.sendGameMessageAsync('changeStat', 'allowlistProbe', 5);

            const allMessages = JSON.stringify(opponent.receivedEvents('gamestate').map((e) => e.args[0]?.newMessages));
            expect(allMessages).not.toContain('allowlistProbe');
        });
    });
});
