import { logger } from '../../logger';
import type Game from '../../game/core/Game';
import type { Player } from '../../game/core/Player';
import type { IDecklistInternal } from '../deck/DeckInterfaces';
import { setCodeToString } from '../../Util';


interface SWUstatsGameResult {
    apiKey: string;
    winner: number; // 1 or 2
    firstPlayer: number; // 1 or 2
    round: number;
    winHero: string;
    loseHero: string;
    winnerDeck?: string;
    loserDeck?: string;
    winnerHealth: number;
    player1: string; // JSON string with leader/base info
    player2: string; // JSON string with leader/base info
    p1DeckLink: string;
    p2DeckLink: string;
    p1id?: string;
    p2id?: string;
    gameName: string;
    sequenceNumber?: number;
}

interface PlayerData {
    gameId?: string;            // Unique game identifier (optional)
    gameName?: string;          // Custom game name (optional)
    deckId: string;             // The last part of the deck link
    leader: string;             // Leader id (FFG UID format)
    base: string;               // Base id (FFG UID format)
    turns: number;              // Number of turns played
    result: number;             // 1 if this player won, 0 for loss
    firstPlayer: number;        // 1 if this player went first, 0 otherwise
    opposingHero: string;       // Opponent's leader id (FFG UID format)
    opposingBaseColor: string;  // Opponent's base color (Red, Blue, Yellow, Green, Colorless)
    deckbuilderID?: string;     // Deckbuilder user ID
}

export class SwuStatsHandler {
    private readonly apiUrl: string;
    private readonly apiKey: string;

    public constructor() {
        // Use environment variable for API URL, defaulting to the known endpoint
        this.apiUrl = process.env.SWUStatsURL;
        this.apiKey = process.env.SWUStatsAPIKey;
        const isDev = process.env.ENVIRONMENT === 'development';
        if (!this.apiKey) {
            logger.warn('SWUStatsHandler: No API key configured. Stats may not be accepted by SWUstats.');
        }
        if (!this.apiUrl) {
            logger.warn('SWUStatsHandler: No URL configured. Stats may not be accepted by SWUstats.');
        }
        if (!isDev && (!this.apiUrl || !this.apiKey)) {
            throw new Error('SwuStatsHandler: No URL configured or apiKey for SWUStats.');
        }
    }

    /**
     * Send game result to SWUstats API
     * @param game The completed game
     * @param player1DeckId Player 1 deck ID
     * @param player2DeckId Player 2 deck ID
     * @returns Promise that resolves to true if successful, false otherwise
     */
    public async sendGameResultAsync(
        game: Game,
        player1DeckId: string,
        player2DeckId: string,
        player1Deck: IDecklistInternal,
        player2Deck: IDecklistInternal
    ): Promise<boolean> {
        try {
            const players = game.getPlayers();
            if (players.length !== 2) {
                logger.info(`Cannot send SWUstats for game with ${players.length} players`);
                return false;
            }

            const [player1, player2] = players;

            // Determine winner
            const winner = this.determineWinner(game, player1, player2);
            if (winner === 0) {
                logger.info(`Game ${game.id} ended in a draw or without clear winner, not sending to SWUstats`);
                return false;
            }

            // Build the payload
            const payload = this.buildGameResultPayload(
                game,
                player1,
                player2,
                player1DeckId,
                player2DeckId,
                player1Deck,
                player2Deck,
                winner
            );
            // Log the payload for debugging
            logger.info(`Sending game result to SWUstats for game ${game.id}`, {
                gameId: game.id,
                winner: payload.winner,
                round: payload.round,
                winnerHealth: payload.winnerHealth
            });
            // Send to SWUstats API
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`SWUstats API returned error: ${response.status} - ${errorText}`);
                return false;
            }

            logger.info(`Successfully sent game result to SWUstats for game ${game.id}`);
            return true;
        } catch (error) {
            logger.error('Failed to send game result to SWUstats', {
                error: { message: error.message, stack: error.stack },
                gameId: game?.id
            });
            throw new Error('Failed to send game result to SWUstats');
        }
    }

    /**
     * Determine which player won (1 or 2), or 0 for draw
     */
    private determineWinner(game: Game, player1: Player, player2: Player): number {
        if (game.winnerNames.length > 1) {
            return 0;
        }
        if (game.winnerNames.includes(player1.name)) {
            return 1;
        } else if (game.winnerNames.includes(player2.name)) {
            return 2;
        }
        throw new Error(`(SWUStats handler): There was an error when determining winner between ${player1.name} and ${player2.name}`);
    }

    /**
     * Build the game result payload for SWUstats API
     */
    private buildGameResultPayload(
        game: Game,
        player1: Player,
        player2: Player,
        player1DeckLink: string,
        player2DeckLink: string,
        player1Deck: IDecklistInternal,
        player2Deck: IDecklistInternal,
        winner: number
    ): SWUstatsGameResult {
        // Get leader and base IDs
        const p1Leader = player1.leader?.setId;
        const p1Base = player1.base?.setId;
        const p2Leader = player2.leader?.setId;
        const p2Base = player2.base?.setId;

        // Format leader/base IDs as strings (e.g., "SOR_001")
        const p1LeaderStr = setCodeToString(p1Leader);
        const p1BaseStr = setCodeToString(p1Base);
        const p2LeaderStr = setCodeToString(p2Leader);
        const p2BaseStr = setCodeToString(p2Base);

        // Determine first player (1 or 2)
        const firstPlayer = game.initialFirstPlayer?.id === player1.id ? 1 : 2;

        // Get winner's remaining health
        const winnerPlayer = winner === 1 ? player1 : player2;
        const winnerHealth = winnerPlayer.base?.remainingHp || 0;

        // Get winner and loser heroes
        const winHero = winner === 1 ? p1LeaderStr : p2LeaderStr;
        const loseHero = winner === 1 ? p2LeaderStr : p1LeaderStr;

        // Build player data JSON
        const player1Data: PlayerData = {
            deckId: player1DeckLink ? player1DeckLink.split('https://swustats.net/TCGEngine/')[1] : '',
            leader: p1LeaderStr,
            base: p1BaseStr,
            turns: game.roundNumber,
            result: winner === 1 ? 1 : 0,
            firstPlayer: game.initialFirstPlayer?.id === player1.id ? 1 : 0,
            opposingHero: p2LeaderStr,
            opposingBaseColor: 'colorless',
        };

        const player2Data: PlayerData = {
            deckId: player2DeckLink ? player2DeckLink.split('https://swustats.net/TCGEngine/')[1] : '',
            leader: p2LeaderStr,
            base: p2BaseStr,
            turns: game.roundNumber,
            result: winner === 2 ? 1 : 0,
            firstPlayer: game.initialFirstPlayer?.id === player2.id ? 1 : 0,
            opposingHero: p1LeaderStr,
            opposingBaseColor: 'colorless',
        };

        return {
            apiKey: this.apiKey,
            winner,
            firstPlayer,
            p1DeckLink: player1DeckLink,
            p2DeckLink: player2DeckLink,
            player1: JSON.stringify(player1Data),
            player2: JSON.stringify(player2Data),
            round: game.roundNumber,
            winnerHealth,
            gameName: String(game.id),
            winHero,
            loseHero,
            winnerDeck: winner === 1 ? JSON.stringify(player1Deck) : JSON.stringify(player2Deck),
            loserDeck: winner === 1 ? JSON.stringify(player2Deck) : JSON.stringify(player1Deck),
        };
    }
}