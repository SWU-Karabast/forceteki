import { premierBestOfOne, premierBestOfThree } from '../../../helpers/server/MatchConfigs';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { TestClient } from '../../../helpers/server/TestClient';

/**
 * `getGameLog` serves a game's `.swupgn`. The file names hidden information (hands, deck order,
 * decklists and sideboards), so it is served only once nothing more can be played against it:
 * after the game ends, and in a best-of-three only after the set is over.
 */
describe('Lobby game log download', function () {
    serverIntegration(function (contextRef) {
        const requestGameLogAsync = async (client: TestClient) => {
            let reply: any;
            await client.sendLobbyMessageAsync('getGameLog', (data: any) => {
                reply = data;
            });
            return reply;
        };

        it('refuses while the game is still in progress', async function () {
            const { harness } = contextRef;
            const { first: player } = await harness.startQuickGameAsync();

            const reply = await requestGameLogAsync(player);

            expect(reply).toEqual({ error: 'Game is still in progress' });
        });

        it('serves both players the same file once the game has ended', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync();

            await player.sendGameMessageAsync('concede');
            const mine = await requestGameLogAsync(player);
            const theirs = await requestGameLogAsync(opponent);

            expect(typeof mine?.swuPgnFile).toBe('string');
            expect(theirs?.swuPgnFile).toBe(mine.swuPgnFile);
        });

        it('withholds the file in a best-of-three until the set is over', async function () {
            const { harness } = contextRef;
            const { first: player } = await harness.startQuickGameAsync({ authenticated: true }, { authenticated: true }, premierBestOfThree);

            await player.sendGameMessageAsync('concede');
            expect(await requestGameLogAsync(player)).toEqual({ error: 'The game log is available when the match ends' });

            await player.sendLobbyMessageAsync('concedeBo3');
            const reply = await requestGameLogAsync(player);
            expect(typeof reply?.swuPgnFile).toBe('string');
        });

        // Value: protects=a request made in a lobby whose game has not started gets an error reply rather than no reply;
        // fails_when=the no-game guard is removed, so the handler throws on a null game and the client's callback never fires;
        // why_new=every other case here starts a game first; seam=none; no_claim=a lobby whose finished game was torn down for a rematch
        it('refuses before any game has started in the lobby', async function () {
            const { harness } = contextRef;
            const host = harness.createClient();
            await host.createLobbyAsync({ lobbyName: harness.uniqueLobbyName(), deck: harness.decklists.validDecklist(), isPrivate: true, ...premierBestOfOne });
            await host.connectAsync();

            const reply = await requestGameLogAsync(host);

            expect(reply).toEqual({ error: 'No active game' });
        });

        // Value: protects=a best-of-three won two games to nil serves the file once the second game ends, and not between games;
        // fails_when=isMatchOver stops counting wins and relies on the stored setEndResult, which a 2-0 win without action timers never stores;
        // why_new=the existing set case ends the set by concedeBo3 after one game; seam=none; no_claim=a 2-1 set, or one ended by timeout
        it('serves the file in a best-of-three once a player has won two games', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync({ authenticated: true }, { authenticated: true }, premierBestOfThree);

            await player.sendGameMessageAsync('concede');
            await player.sendLobbyMessageAsync('proceedToNextBo3Game');
            await opponent.sendLobbyMessageAsync('proceedToNextBo3Game');
            expect(player.lobbyState.winHistory.currentGameNumber).toBe(2);
            await player.sendLobbyMessageAsync('setReadyStatus', true);
            await opponent.sendLobbyMessageAsync('setReadyStatus', true);
            expect(await requestGameLogAsync(player)).toEqual({ error: 'Game is still in progress' });

            await player.sendGameMessageAsync('concede');
            const reply = await requestGameLogAsync(opponent);
            expect(typeof reply?.swuPgnFile).toBe('string');
        });

        const undoToSetupAsync = async (client: TestClient) => {
            await client.sendGameMessageAsync('rollbackToSnapshot', { type: 'phase', phaseName: 'setup', playerId: client.id });
        };

        // Value: protects=an undo sent over the socket reopens an ended game whose log was not downloaded (control for the lock case below); fails_when=the socket undo never reaches the game, which would make the lock case pass vacuously; why_new=no lobby spec sends an undo; seam=none; no_claim=request-mode approval prompts
        it('lets a player undo an ended game whose log was not downloaded', async function () {
            const { harness } = contextRef;
            const { first: player } = await harness.startQuickGameAsync();

            await player.sendGameMessageAsync('concede');
            expect(player.gameState?.winners?.length).toBe(1);
            await undoToSetupAsync(player);

            expect(player.gameState?.winners).toEqual([]);
        });

        // Value: protects=a download over the socket closes the ended game to undo and keeps the served file; fails_when=Lobby.getGameLog stops calling markSwuPgnServed; why_new=SwuPgnServedLogUndoLock.spec calls the Game seam directly; seam=none; no_claim=request-mode approval prompts
        it('keeps an ended game closed to undo once its log was downloaded', async function () {
            const { harness } = contextRef;
            const { first: player } = await harness.startQuickGameAsync();

            await player.sendGameMessageAsync('concede');
            const served = await requestGameLogAsync(player);
            expect(typeof served?.swuPgnFile).toBe('string');
            await undoToSetupAsync(player);

            expect(player.gameState?.winners?.length).toBe(1);
            expect(await requestGameLogAsync(player)).toEqual(served);
        });
    });
});
