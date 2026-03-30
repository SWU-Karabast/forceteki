import type { Game } from '../../../server/game/core/Game';
import { CardPool, GamesToWinMode, SwuGameFormat } from '../../../server/game/core/Constants';
import { Lobby, MatchmakingType } from '../../../server/gamenode/Lobby';

describe('Lobby game ownership', function() {
    function createLobby(gamesToWinMode = GamesToWinMode.BestOfOne): Lobby {
        return new Lobby(
            'Memory leak test lobby',
            MatchmakingType.PublicLobby,
            SwuGameFormat.Premier,
            gamesToWinMode,
            CardPool.Current,
            {} as any,
            {} as any,
            {} as any,
            {} as any
        );
    }

    function createGame(finishedAt?: Date): Game {
        return {
            destroy: jasmine.createSpy('destroy'),
            finishedAt
        } as unknown as Game;
    }

    function attachGame(lobby: Lobby, game: Game): void {
        (lobby as unknown as { game?: Game }).game = game;
    }

    function getAttachedGame(lobby: Lobby): Game | undefined {
        return (lobby as unknown as { game?: Game }).game;
    }

    function setBo3Winners(lobby: Lobby, winnerIdsInOrder: string[]): void {
        (lobby as unknown as { winHistory: { winnerIdsInOrder: string[] } }).winHistory.winnerIdsInOrder = winnerIdsInOrder;
    }

    it('treats only unfinished games as ongoing', function() {
        const lobby = createLobby();
        const activeGame = createGame();

        expect(lobby.hasOngoingGame()).toBeFalse();

        attachGame(lobby, activeGame);
        expect(lobby.hasOngoingGame()).toBeTrue();
        expect(lobby.getLobbyState().gameOngoing).toBeTrue();

        activeGame.finishedAt = new Date();
        expect(lobby.hasOngoingGame()).toBeFalse();
        expect(lobby.getLobbyState().gameOngoing).toBeFalse();
    });

    it('destroys permanently finished best-of-one games during cleanup', function() {
        const lobby = createLobby();
        const finishedGame = createGame(new Date());
        attachGame(lobby, finishedGame);

        lobby.cleanupFinishedGame(finishedGame);

        expect(finishedGame.destroy).toHaveBeenCalled();
        expect(getAttachedGame(lobby)).toBeUndefined();
    });

    it('retains finished best-of-three games while the set is still in progress', function() {
        const lobby = createLobby(GamesToWinMode.BestOfThree);
        const finishedGame = createGame(new Date());
        attachGame(lobby, finishedGame);

        setBo3Winners(lobby, ['player-1']);

        lobby.cleanupFinishedGame(finishedGame);

        expect(finishedGame.destroy).not.toHaveBeenCalled();
        expect(getAttachedGame(lobby)).toBe(finishedGame);
        expect(lobby.getLobbyState().gameOngoing).toBeFalse();
    });

    it('destroys finished best-of-three games once the set is complete', function() {
        const lobby = createLobby(GamesToWinMode.BestOfThree);
        const finishedGame = createGame(new Date());
        attachGame(lobby, finishedGame);

        setBo3Winners(lobby, ['player-1', 'player-1']);

        lobby.cleanupFinishedGame(finishedGame);

        expect(finishedGame.destroy).toHaveBeenCalled();
        expect(getAttachedGame(lobby)).toBeUndefined();
    });

    it('destroys the current game when cleaning the lobby', function() {
        const lobby = createLobby();
        const activeGame = createGame();
        attachGame(lobby, activeGame);
        lobby.users = [{ id: 'player-1' } as any];
        lobby.spectators = [{ id: 'spectator-1' } as any];

        lobby.cleanLobby();

        expect(activeGame.destroy).toHaveBeenCalled();
        expect(getAttachedGame(lobby)).toBeUndefined();
        expect(lobby.users).toEqual([]);
        expect(lobby.spectators).toEqual([]);
    });
});
