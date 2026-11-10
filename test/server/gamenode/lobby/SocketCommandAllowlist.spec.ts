import { premierBestOfThree } from '../../../helpers/server/MatchConfigs';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';

/**
 * Lobby and game socket messages name the method to call. Only the commands the client actually
 * sends may be invoked; every other method on Lobby and Game is server-internal.
 */
describe('Socket command allowlist', function () {
    serverIntegration(function (contextRef) {
        it('ignores a lobby command naming a server-internal method', async function () {
            const { owner, guest } = await contextRef.harness.createLobbyWithGuestAsync({}, {}, { isPrivate: true });

            // would empty the lobby's user list if it ran
            await owner.sendLobbyMessageAsync('cleanLobby');
            await guest.sendChatMessageAsync('still here');

            expect(owner.lobbyChatFrom(guest)).toEqual(['still here']);
        });

        it('accepts concedeBo3, which the client sends to concede a best-of-three set', async function () {
            const { owner } = await contextRef.harness.createLobbyWithGuestAsync({}, {}, { isPrivate: true, config: premierBestOfThree });

            await owner.concedeBo3Async();

            expect(owner.lobbyState.winHistory.setEndResult?.endedReason).toBe('concede');
        });

        it('accepts proceedToNextBo3Game, which the client sends to start the next game of a set', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync({ authenticated: true }, { authenticated: true }, premierBestOfThree);

            await player.concedeAsync();
            await player.proceedToNextBo3GameAsync();
            await opponent.proceedToNextBo3GameAsync();

            expect(player.lobbyState.winHistory.currentGameNumber).toBe(2);
        });

        it('ignores a game command naming a server-internal method', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync();

            // would add to an arbitrary field on the player and log "sets allowlistProbe to ..." if it ran
            await player.sendGameMessageAsync('changeStat', 'allowlistProbe', 5);

            expect(opponent.gameChat.some((entry) => entry.text.includes('allowlistProbe'))).toBeFalse();
        });
    });
});
