import { logger } from '../../logger';
import type Game from '../../game/core/Game';
import type { Player } from '../../game/core/Player';
import type { IDecklistInternal } from '../deck/DeckInterfaces';
import type { IBaseCard } from '../../game/core/card/BaseCard';
import { Aspect } from '../../game/core/Constants';


interface TurnResults {
    cardsUsed: number;           // Cards played this turn
    resourcesUsed: number;       // Resources spent
    resourcesLeft: number;       // Resources remaining
    cardsLeft: number;           // Cards left in hand
    damageDealt: number;         // Damage dealt this turn
    damageTaken: number;         // Damage received this turn
}

interface CardResults {
    cardId: string;            // Card id (FFG UID format)
    played: number;            // Times played
    resourced: number;         // Times used as resource
    activated: number;         // Times ability activated
    drawn: number;             // Times drawn
    discarded: number;         // Times discarded
}

interface SWUstatsGameResult {
    apiKey: string;
    winner: number; // 1 or 2
    firstPlayer: number; // 1 or 2
    round: number;
    winHero: string;
    loseHero: string;
    winnerDeck?: IDecklistInternal;
    loserDeck?: IDecklistInternal;
    winnerHealth: number;
    player1: PlayerData;
    player2: PlayerData;
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
    cardResults?: CardResults[];
    turnResults?: TurnResults[];
}

export class SwuStatsHandler {
    private readonly apiUrl: string;
    private readonly apiKey: string;

    public constructor() {
        // Use environment variable for API URL, defaulting to the known endpoint
        this.apiUrl = 'https://swustats.net/TCGEngine/APIs/SubmitGameResult.php';
        this.apiKey = process.env.SWUStatsAPIKey;
        const isDev = process.env.ENVIRONMENT === 'development';
        if (!this.apiKey) {
            logger.warn('SWUStatsHandler: No API key configured. Stats may not be accepted by SWUstats.');
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
                winner
            );
            // Log the payload for debugging (excluding API key)
            const { apiKey, ...payloadForLogging } = payload;
            logger.info(`Sending game result to SWUstats for game ${game.id}`, {
                gameId: game.id,
                payload: payloadForLogging
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
    * Determines the color of a base card based on its aspects
    */
    private getBaseColor(base: IBaseCard): string {
        if (!base || !base.aspects) {
            return 'colorless';
        }

        const aspectColorMap = {
            [Aspect.Aggression]: 'red',
            [Aspect.Command]: 'green',
            [Aspect.Cunning]: 'yellow',
            [Aspect.Vigilance]: 'blue'
        };

        for (const aspect of base.aspects) {
            if (aspectColorMap[aspect]) {
                return aspectColorMap[aspect];
            }
        }

        // If no colored aspects found, it's colorless
        return 'colorless';
    }

    /**
     * Build player data for a single player
     */
    private buildPlayerData(
        player: Player,
        opponentPlayer: Player,
        deckLink: string,
        game: Game,
        winner: number,
        playerNumber: number
    ): PlayerData {
        const leaderStr = player.leader?.id;
        const baseStr = player.base?.id;
        const opponentLeaderStr = opponentPlayer.leader?.id;
        const opponentBaseColor = this.getBaseColor(opponentPlayer.base);
        return {
            deckId: deckLink ? deckLink.split('https://swustats.net/TCGEngine/')[1] : '',
            leader: leaderStr,
            base: baseStr,
            turns: game.roundNumber,
            result: winner === playerNumber ? 1 : 0,
            firstPlayer: game.initialFirstPlayer?.id === player.id ? 1 : 0,
            opposingHero: opponentLeaderStr,
            opposingBaseColor: opponentBaseColor,
            cardResults: [],
            turnResults: []
        };
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
        winner: number
    ): SWUstatsGameResult {
        const player1Data = this.buildPlayerData(player1, player2, player1DeckLink, game, winner, 1);
        const player2Data = this.buildPlayerData(player2, player1, player2DeckLink, game, winner, 2);

        const firstPlayer = player1Data.firstPlayer === 1 ? 1 : 2;
        const winHero = winner === 1 ? player1Data.leader : player2Data.leader;
        const loseHero = winner === 1 ? player2Data.leader : player1Data.leader;

        // Get winner's remaining health
        const winnerPlayer = winner === 1 ? player1 : player2;
        const winnerHealth = winnerPlayer.base?.remainingHp || 0;

        return {
            apiKey: this.apiKey,
            winner,
            firstPlayer,
            p1DeckLink: player1DeckLink,
            p2DeckLink: player2DeckLink,
            player1: player1Data,
            player2: player2Data,
            round: player1Data.turns,
            winnerHealth,
            gameName: String(game.id),
            winHero,
            loseHero,
        };
    }
}