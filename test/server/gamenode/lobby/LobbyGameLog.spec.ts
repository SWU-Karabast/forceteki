import { SwuPgnGameAdapter } from '../../../../server/game/core/chat/SwuPgnGameAdapter';
import { parse } from '../../../../swupgn/src/parse';
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

        const refusal = 'cannot become a best-of-three';

        // Value: protects=a best-of-one whose log a player downloaded is not turned into the first game of a best-of-three, whose games keep decklists hidden; fails_when=requestRematch or rematch() accepts bo1ConvertToBo3 after the log was served; why_new=no case downloads and then rematches; seam=none; no_claim=the other rematch modes, which stay best-of-one
        it('does not turn a best-of-one into a best-of-three once its log was downloaded', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync();

            await player.sendGameMessageAsync('concede');
            await player.sendLobbyMessageAsync('requestRematch', 'bo1ConvertToBo3');
            expect(player.lobbyState.rematchRequest?.mode).withContext('asked before the download')
                .toBe('bo1ConvertToBo3');

            expect(typeof (await requestGameLogAsync(opponent))?.swuPgnFile).toBe('string');
            await opponent.sendLobbyMessageAsync('rematch');
            expect(player.lobbyState.rematchRequest).withContext('accepted after the download')
                .toBeNull();
            expect(player.lobbyState.winHistory.gamesToWinMode).toBe('bestOfOne');

            const before = opponent.receivedEvents('gamestate').length;
            await player.sendLobbyMessageAsync('requestRematch', 'bo1ConvertToBo3');
            expect(player.lobbyState.rematchRequest).withContext('asked after the download')
                .toBeNull();
            // Value: protects=a refused conversion request tells the players why, in the game's chat while the finished game is still open; fails_when=the request's refusal is silent, or goes to the lobby chat the game view does not show; why_new=the case asserted only that the request vanished; seam=none; no_claim=the alert's wording beyond its key phrase
            expect(JSON.stringify(opponent.receivedEvents('gamestate').slice(before)
                .map((e) => e.args[0]))).withContext('the game chat names the refusal')
                .toContain(refusal);
        });

        // Value: protects=a plain rematch does not reopen conversion for decks a downloaded log names; fails_when=the refusal reads the finished game, which a rematch drops while the result it converts is kept; why_new=the case above converts the downloaded game itself; seam=none; no_claim=a game played between the download and the conversion
        it('does not convert after a plain rematch while the decks are the ones a downloaded log names', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync();

            await player.sendGameMessageAsync('concede');
            expect(typeof (await requestGameLogAsync(player))?.swuPgnFile).toBe('string');
            await player.sendLobbyMessageAsync('requestRematch', 'regular');
            await opponent.sendLobbyMessageAsync('rematch');
            expect(player.lobbyState.gameOngoing).withContext('the rematch dropped the game')
                .toBeFalse();

            await player.sendLobbyMessageAsync('requestRematch', 'bo1ConvertToBo3');
            await opponent.sendLobbyMessageAsync('rematch');

            expect(player.lobbyState.winHistory.gamesToWinMode).toBe('bestOfOne');
            // Value: protects=with no game open the refusal alert reaches the lobby chat; fails_when=the alert goes only to a game that a rematch dropped (or throws on it); why_new=the case asserted only the mode; seam=none; no_claim=the alert's wording beyond its key phrase
            expect(JSON.stringify(opponent.lobbyState.gameChat?.messages ?? null)).withContext('the lobby chat names the refusal')
                .toContain(refusal);
        });

        // Value: protects=the refusal follows the decks the downloaded log names, not who reloaded: the same deck again keeps it, a different deck from every player lifts it; fails_when=any deck load clears a player, or a different deck does not; why_new=no case loads a deck after a download; seam=none; no_claim=a sideboard swap, which reveals nothing new and keeps the refusal
        it('converts again only once every player holds a deck the downloaded log does not name', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync();

            await player.sendGameMessageAsync('concede');
            expect(typeof (await requestGameLogAsync(player))?.swuPgnFile).toBe('string');
            const lobbyId = player.lobbyState.id;
            expect((await player.changeDeckAsync(lobbyId, harness.decklists.validDecklist())).status).toBe(200);
            expect((await opponent.changeDeckAsync(lobbyId, harness.decklists.validDecklist())).status).toBe(200);
            await player.sendLobbyMessageAsync('requestRematch', 'bo1ConvertToBo3');
            expect(player.lobbyState.rematchRequest).withContext('both loaded the same decks again')
                .toBeNull();

            expect((await player.changeDeckAsync(lobbyId, harness.decklists.validDecklist({ leaderIndex: 1 }))).status).toBe(200);
            await player.sendLobbyMessageAsync('requestRematch', 'bo1ConvertToBo3');
            expect(player.lobbyState.rematchRequest).withContext('the opponent\'s deck is still the downloaded one')
                .toBeNull();

            expect((await opponent.changeDeckAsync(lobbyId, harness.decklists.validDecklist({ leaderIndex: 1 }))).status).toBe(200);
            await player.sendLobbyMessageAsync('requestRematch', 'bo1ConvertToBo3');
            await opponent.sendLobbyMessageAsync('rematch');

            expect(player.lobbyState.winHistory.gamesToWinMode).toBe('bestOfThree');
        });

        // Value: protects=a log names the cards of a deck, so moving one between deck and sideboard, or reordering the list, is the same deck; fails_when=the key counts deck and sideboard apart or depends on order; why_new=the reload case loads an identical list; seam=none; no_claim=reprint set codes, which the key also folds by internal name
        it('keeps refusing after the downloaded deck is reordered or a card is moved to the sideboard', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync();

            await player.sendGameMessageAsync('concede');
            expect(typeof (await requestGameLogAsync(player))?.swuPgnFile).toBe('string');
            const lobbyId = player.lobbyState.id;
            const played = harness.decklists.validDecklist();
            expect((await player.changeDeckAsync(lobbyId, harness.decklists.validDecklist({ leaderIndex: 1 }))).status).toBe(200);
            expect((await opponent.changeDeckAsync(lobbyId, { ...played, deck: [...played.deck].reverse() })).status).toBe(200);
            await opponent.sendLobbyMessageAsync('updateDeck', 'Deck', played.deck[0].id);
            await player.sendLobbyMessageAsync('requestRematch', 'bo1ConvertToBo3');

            expect(player.lobbyState.rematchRequest).toBeNull();
        });

        // Value: protects=what is recorded is the deck the game was played with, not the one loaded after it ended; fails_when=the download records the lobby's current deck; why_new=every other case downloads before any deck change; seam=none; no_claim=a player who left before the download, which the same game-player record covers
        it('records the deck the game was played with when a player changes deck before the download', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync();

            await player.sendGameMessageAsync('concede');
            const lobbyId = player.lobbyState.id;
            expect((await player.changeDeckAsync(lobbyId, harness.decklists.validDecklist({ leaderIndex: 1 }))).status).toBe(200);
            expect((await opponent.changeDeckAsync(lobbyId, harness.decklists.validDecklist({ leaderIndex: 1 }))).status).toBe(200);
            expect(typeof (await requestGameLogAsync(player))?.swuPgnFile).toBe('string');
            await player.sendLobbyMessageAsync('requestRematch', 'bo1ConvertToBo3');
            expect(player.lobbyState.rematchRequest?.mode).withContext('the decks now are not the ones the log names')
                .toBe('bo1ConvertToBo3');

            expect((await opponent.changeDeckAsync(lobbyId, harness.decklists.validDecklist())).status).toBe(200);
            await opponent.sendLobbyMessageAsync('rematch');

            expect(player.lobbyState.winHistory.gamesToWinMode).withContext('the opponent went back to the deck the log names')
                .toBe('bestOfOne');
        });

        // Value: protects=every download adds to what a player holds, so a later log does not forget an earlier deck; fails_when=a second download replaces the first record; why_new=the other cases serve one log; seam=none; no_claim=more than two games
        it('remembers a deck from an earlier downloaded log after a later one', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync();
            const lobbyId = player.lobbyState.id;

            await player.sendGameMessageAsync('concede');
            expect(typeof (await requestGameLogAsync(player))?.swuPgnFile).toBe('string');
            expect((await opponent.changeDeckAsync(lobbyId, harness.decklists.validDecklist({ leaderIndex: 1 }))).status).toBe(200);
            await player.sendLobbyMessageAsync('requestRematch', 'regular');
            await opponent.sendLobbyMessageAsync('rematch');
            await player.sendLobbyMessageAsync('setReadyStatus', true);
            await opponent.sendLobbyMessageAsync('setReadyStatus', true);
            const owner = player.lobbyState.lobbyOwnerId === player.id ? player : opponent;
            await owner.sendLobbyMessageAsync('startGameAsync');
            expect(player.lobbyState.gameOngoing).withContext('the second game started')
                .toBeTrue();
            await player.sendGameMessageAsync('concede');
            expect(typeof (await requestGameLogAsync(player))?.swuPgnFile).toBe('string');

            expect((await opponent.changeDeckAsync(lobbyId, harness.decklists.validDecklist())).status).toBe(200);
            expect((await player.changeDeckAsync(lobbyId, harness.decklists.validDecklist({ leaderIndex: 2 }))).status).toBe(200);
            await player.sendLobbyMessageAsync('requestRematch', 'bo1ConvertToBo3');

            expect(player.lobbyState.rematchRequest).withContext('the first log named the opponent\'s deck')
                .toBeNull();
        });

        // Value: protects=a downloaded log names the downloader's own deck too, so an opponent who later loads that deck is still refused; fails_when=the download records only the other players' decks; why_new=the other cases have both players on one list; seam=none; no_claim=two-leader decks, whose leader order the key also ignores
        it('refuses once the opponent loads the deck the downloader played', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync();
            const lobbyId = player.lobbyState.id;
            const mine = harness.decklists.validDecklist({ leaderIndex: 1 });

            await player.sendGameMessageAsync('concede');
            expect((await player.changeDeckAsync(lobbyId, mine)).status).toBe(200);
            await player.sendLobbyMessageAsync('requestRematch', 'regular');
            await opponent.sendLobbyMessageAsync('rematch');
            await player.sendLobbyMessageAsync('setReadyStatus', true);
            await opponent.sendLobbyMessageAsync('setReadyStatus', true);
            const owner = player.lobbyState.lobbyOwnerId === player.id ? player : opponent;
            await owner.sendLobbyMessageAsync('startGameAsync');
            await player.sendGameMessageAsync('concede');
            expect(typeof (await requestGameLogAsync(player))?.swuPgnFile).toBe('string');

            expect((await opponent.changeDeckAsync(lobbyId, mine)).status).toBe(200);
            expect((await player.changeDeckAsync(lobbyId, harness.decklists.validDecklist({ leaderIndex: 2 }))).status).toBe(200);
            await player.sendLobbyMessageAsync('requestRematch', 'bo1ConvertToBo3');

            expect(player.lobbyState.rematchRequest).withContext('the log named the deck the opponent holds now')
                .toBeNull();
        });

        // Value: protects=the file names every card %%% DECKS lists, a card only in a sideboard included, so a reader needs no card database; fails_when=the CARDS index is built only from the cards loaded into the game; why_new=no spec plays a deck with a sideboard; seam=none; no_claim=a sideboard card's kind, which the card map does not carry
        it('names a card that is only in a sideboard in the downloaded file', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync();
            const lobbyId = player.lobbyState.id;
            const withSideboard = harness.decklists.validDecklist({ leaderIndex: 1, sideboardCards: 1 });
            const sideboardId = withSideboard.sideboard[0].id;

            await player.sendGameMessageAsync('concede');
            expect((await player.changeDeckAsync(lobbyId, withSideboard)).status).toBe(200);
            await player.sendLobbyMessageAsync('requestRematch', 'regular');
            await opponent.sendLobbyMessageAsync('rematch');
            await player.sendLobbyMessageAsync('setReadyStatus', true);
            await opponent.sendLobbyMessageAsync('setReadyStatus', true);
            const owner = player.lobbyState.lobbyOwnerId === player.id ? player : opponent;
            await owner.sendLobbyMessageAsync('startGameAsync');
            await player.sendGameMessageAsync('concede');
            const doc = parse((await requestGameLogAsync(player))?.swuPgnFile);
            const [set, number] = sideboardId.split('_');
            const printedId = `${set.toUpperCase()}#${number.padStart(3, '0')}`;

            expect(doc.decks.some((d) => d.sideboard?.some(([id]) => id === printedId))).withContext('the deck record lists it')
                .toBeTrue();
            expect(doc.cards?.find((c) => c.id === printedId)?.name).withContext('the index names it')
                .toEqual(jasmine.any(String));
        });

        // Value: protects=a refused conversion request leaves a pending rematch of another mode in place; fails_when=the refusal clears whatever request is pending; why_new=the cases above have no other request pending; seam=none; no_claim=the rematch itself, accepted elsewhere
        it('keeps a pending rematch of another mode when a conversion is refused', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync();

            await player.sendGameMessageAsync('concede');
            expect(typeof (await requestGameLogAsync(player))?.swuPgnFile).toBe('string');
            await opponent.sendLobbyMessageAsync('requestRematch', 'regular');
            await player.sendLobbyMessageAsync('requestRematch', 'bo1ConvertToBo3');

            expect(player.lobbyState.rematchRequest?.mode).toBe('regular');
        });

        // Value: protects=a best-of-one whose log nobody downloaded still converts to a best-of-three (control for the case above); fails_when=the refusal fires on every converted game; why_new=no lobby spec converts; seam=none; no_claim=the second game of the set
        it('still turns a best-of-one into a best-of-three when its log was not downloaded', async function () {
            const { harness } = contextRef;
            const { first: player, second: opponent } = await harness.startQuickGameAsync();

            await player.sendGameMessageAsync('concede');
            await player.sendLobbyMessageAsync('requestRematch', 'bo1ConvertToBo3');
            await opponent.sendLobbyMessageAsync('rematch');

            expect(player.lobbyState.winHistory.gamesToWinMode).toBe('bestOfThree');
        });

        // TODO: cover getGameLog's players-only refusal ('Only the players of this game can download its
        // log'). It cannot be reached over the socket yet: someone who takes a seat after the game was
        // played is dropped while connecting ("Error connecting to lobby"): addLobbyUserAsync's
        // updateUserLastActivity calls game.onPlayerAction for them, and getPlayerById fails its
        // Contract for a non-player. See Open finding #10 in long-term-project-docs/game-node-test-suite.md.

        // Value: protects=a log that failed to generate at game end is reported as an error, not served, and leaves the game open to undo; fails_when=getGameLog sends a success-shaped reply without a file, retries generation, or marks the game served; why_new=no case made generation fail; seam=none; no_claim=what makes generation fail in production
        it('reports a log that failed to generate, and leaves the game open to undo', async function () {
            const { harness } = contextRef;
            const { first: player } = await harness.startQuickGameAsync();
            const generate = spyOn(SwuPgnGameAdapter.prototype, 'generateFile').and.throwError('generation broke');

            await player.sendGameMessageAsync('concede');
            const reply = await requestGameLogAsync(player);
            const attempts = generate.calls.count();
            await undoToSetupAsync(player);

            expect(reply).toEqual({ error: 'Failed to generate game log' });
            expect(attempts).withContext('generated once at game end, never again on request')
                .toBe(1);
            expect(player.gameState?.winners).toEqual([]);
        });

        // TODO: the withheld path (Game.isSwuPgnWithheld, set by postRollbackOperations when a served
        // game is reopened) has no spec. Every rollback path refuses once the log is served
        // (SwuPgnServedLogUndoLock.spec), so reaching it needs a rollback route that skips that check.
    });
});
