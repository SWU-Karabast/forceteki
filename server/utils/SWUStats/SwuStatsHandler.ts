import { logger } from '../../logger';
import type Game from '../../game/core/Game';
import type { Player } from '../../game/core/Player';
import type { IDecklistInternal } from '../deck/DeckInterfaces';
import type { IBaseCard } from '../../game/core/card/BaseCard';
import { Aspect } from '../../game/core/Constants';
import { GameCardMetric, type IGameStatisticsTracker } from '../../gameStatistics/GameStatisticsTracker';
import type { PlayerDetails, IStatsMessageFormat } from '../../gamenode/Lobby';
import { StatsSource } from '../../gamenode/Lobby';
import { StatsSaveStatus } from '../../gamenode/Lobby';
import type { GameServer, ISwuStatsToken } from '../../gamenode/GameServer';
import type { UserFactory } from '../user/UserFactory';
import { requireEnvVars } from '../../env';


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
    p1SWUStatsToken: string;
    p2SWUStatsToken: string;
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

interface OAuthTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
}

export class SwuStatsHandler {
    private readonly apiUrl: string;
    private readonly apiKey: string;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly tokenUrl: string;
    private readonly userFactory: UserFactory;

    public constructor(userFactory) {
        // Use environment variable for API URL, defaulting to the known endpoint
        requireEnvVars([
            'SWUSTATS_API_KEY',
            'SWUSTATS_CLIENT_ID',
            'SWUSTATS_CLIENT_SECRET'
        ], 'SWUStats Handler');
        this.apiUrl = 'https://swustats.net/TCGEngine/APIs/SubmitGameResult.php';
        this.tokenUrl = 'https://swustats.net/TCGEngine/APIs/OAuth/token.php';
        this.apiKey = process.env.SWUSTATS_API_KEY;
        this.clientId = process.env.SWUSTATS_CLIENT_ID;
        this.clientSecret = process.env.SWUSTATS_CLIENT_SECRET;
        this.userFactory = userFactory;
    }

    /**
     * Send game result to SWUstats API
     * @param game The completed game
     * @param player1Details Details about player1
     * @param player2Details Details about player2
     * @param lobbyId the lobby id
     * @param serverObject the server object from where we gain access to the user x accessToken
     * @returns Promise that resolves to true if successful, false otherwise
     */
    public async sendSWUStatsGameResultAsync(
        game: Game,
        player1Details: PlayerDetails,
        player2Details: PlayerDetails,
        lobbyId: string,
        serverObject: GameServer,
    ): Promise<IStatsMessageFormat> {
        try {
            const players = game.getPlayers();
            const [player1, player2] = players;

            // Determine winner
            const winner = this.determineWinner(game, player1, player2);
            if (winner === 0) {
                logger.info(`Game ${game.id} ended in a draw or without clear winner, not sending to SWUStats`, { lobbyId });
                return { type: StatsSaveStatus.Warning,
                    source: StatsSource.SwuStats,
                    message: 'draws are currently not supported by SWUStats' };
            }

            // Build the payload
            const payload = await this.buildSWUStatsGameResultPayloadAsync(
                game,
                player1,
                player2,
                player1Details,
                player2Details,
                winner,
                lobbyId,
                serverObject
            );
            // Log the payload for debugging (excluding API key)
            const { apiKey, p1SWUStatsToken, p2SWUStatsToken, ...payloadForLogging } = payload;
            logger.info(`Sending game result to SWUStats for game ${game.id}`, {
                lobbyId,
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
                throw new Error(`SWUStats API returned error: ${response.status} - ${errorText}`);
            }
            logger.info(`Successfully sent game result to SWUStats for game ${game.id}`, { lobbyId });
            return { type: StatsSaveStatus.Success,
                source: StatsSource.SwuStats,
                message: 'successfully sent game result to SWUStats' };
        } catch (error) {
            logger.error('Failed to send game result to SWUStats', {
                error: { message: error.message, stack: error.stack },
                gameId: game.id,
                lobbyId
            });
            throw error;
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

    private getCardResultsByPlayer(player: Player, statsTracker: IGameStatisticsTracker): CardResults[] {
        const cardResultsByTrackingId = new Map<string, CardResults>();
        for (const card of player.allCards) {
            if (cardResultsByTrackingId.has(card.trackingId)) {
                continue;
            }

            cardResultsByTrackingId.set(card.trackingId, {
                cardId: card.trackingId,
                played: 0,
                resourced: 0,
                activated: 0,
                drawn: 0,
                discarded: 0,
            });
        }

        for (const cardMetric of statsTracker.cardMetrics) {
            if (cardMetric.player === player.trackingId && cardResultsByTrackingId.has(cardMetric.card)) {
                const cardResult = cardResultsByTrackingId.get(cardMetric.card);
                switch (cardMetric.metric) {
                    case GameCardMetric.Activated:
                        cardResult.activated += 1;
                        break;
                    case GameCardMetric.Discarded:
                        cardResult.discarded += 1;
                        break;
                    case GameCardMetric.Drawn:
                        cardResult.drawn += 1;
                        break;
                    case GameCardMetric.Played:
                        cardResult.played += 1;
                        break;
                    case GameCardMetric.Resourced:
                        cardResult.resourced += 1;
                        break;
                    default:
                        throw new Error(`(SWUStats handler): Unsupported game card metric ${cardMetric.metric}`);
                }
                cardResultsByTrackingId.set(cardMetric.card, cardResult);
            }
        }

        return Array.from(cardResultsByTrackingId.values());
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
        const cardResults = this.getCardResultsByPlayer(player, game.statsTracker);
        return {
            deckId: deckLink ? deckLink.split('https://swustats.net/TCGEngine/')[1] : '',
            leader: leaderStr,
            base: baseStr,
            turns: game.roundNumber,
            result: winner === playerNumber ? 1 : 0,
            firstPlayer: game.initialFirstPlayer?.id === player.id ? 1 : 0,
            opposingHero: opponentLeaderStr,
            opposingBaseColor: opponentBaseColor,
            cardResults: cardResults,
            turnResults: []
        };
    }


    /**
     * Build the game result payload for SWUstats API
     */
    private async buildSWUStatsGameResultPayloadAsync(
        game: Game,
        player1: Player,
        player2: Player,
        player1Details: PlayerDetails,
        player2Details: PlayerDetails,
        winner: number,
        lobbyId: string,
        serverObject: GameServer
    ): Promise<SWUstatsGameResult> {
        const player1Data = this.buildPlayerData(player1, player2, player1Details.deckLink, game, winner, 1);
        const player2Data = this.buildPlayerData(player2, player1, player2Details.deckLink, game, winner, 2);

        const firstPlayer = player1Data.firstPlayer === 1 ? 1 : 2;
        const winHero = winner === 1 ? player1Data.leader : player2Data.leader;
        const loseHero = winner === 1 ? player2Data.leader : player1Data.leader;
        const p1SWUStatsToken = await this.getAccessTokenAsync(player1Details, lobbyId, serverObject);
        const p2SWUStatsToken = await this.getAccessTokenAsync(player2Details, lobbyId, serverObject);
        // Get winner's remaining health
        const winnerPlayer = winner === 1 ? player1 : player2;
        const winnerHealth = winnerPlayer.base?.remainingHp || 0;

        return {
            apiKey: this.apiKey,
            winner,
            firstPlayer,
            p1DeckLink: player1Details.deckLink,
            p2DeckLink: player2Details.deckLink,
            player1: player1Data,
            player2: player2Data,
            p1SWUStatsToken,
            p2SWUStatsToken,
            round: player1Data.turns,
            winnerHealth,
            gameName: String(game.id),
            winHero,
            loseHero,
        };
    }

    /**
     * Get access tokens for players who have refresh tokens
     * @param playerDetails details on the player id, deckId, decklist etc...
     * @param lobbyId
     * @param serverObject
     * @returns Promise that resolves to an access token for the player or null if no token and no refresh token is present.
     */
    private async getAccessTokenAsync(
        playerDetails: PlayerDetails,
        lobbyId: string,
        serverObject: GameServer,
        forceRefresh: boolean = false,
    ): Promise<string | null> {
        let playerAccessToken: string = null;
        // Handle Player swu token
        if (playerDetails.swuStatsToken && this.isTokenValid(playerDetails.swuStatsToken) && !forceRefresh) {
            playerAccessToken = playerDetails.swuStatsToken.accessToken;
            logger.info(`SWUStatsHandler: Using existing valid access token for player (${playerDetails.user.getId()})`, { lobbyId, userId: playerDetails.user.getId() });
        } else if (playerDetails.swuStatsToken) {
            // Token is expired or doesn't exist, refresh it
            logger.info(`SWUStatsHandler: Access token expired or missing for player (${playerDetails.user.getId()}), refreshing...`, { lobbyId, userId: playerDetails.user.getId() });
            const userRefreshToken = await this.userFactory.getUserSwuStatsRefreshTokenAsync(playerDetails.user);
            const resultTokens = await this.refreshTokensAsync(userRefreshToken);
            serverObject.swuStatsTokenMapping.set(playerDetails.user.getId(), resultTokens);
            playerAccessToken = resultTokens.accessToken;
            await this.userFactory.addSwuStatsRefreshTokenAsync(playerDetails.user.getId(), resultTokens.refreshToken);
        }
        return playerAccessToken;
    }

    /**
     * Check if an access token is still valid (not expired)
     * @param token The token to check
     * @returns True if token is valid, false if expired
     */
    public isTokenValid(token: ISwuStatsToken): boolean {
        const now = new Date();
        const tokenCreationTime = new Date(token.creationDateTime);
        const tokenExpirationTime = new Date(tokenCreationTime.getTime() + (token.timeToLiveSeconds * 1000));

        // Add a small buffer (5 min) to avoid using tokens that are about to expire
        const bufferTimeMs = 5 * 60000;
        const effectiveExpirationTime = new Date(tokenExpirationTime.getTime() - bufferTimeMs);

        return now < effectiveExpirationTime;
    }

    /**
     * Refresh an access token using a refresh token
     * @param refreshToken The refresh token to use
     * @returns Promise that resolves to the new access token, or null if refresh failed
     */
    public async refreshTokensAsync(refreshToken: string): Promise<ISwuStatsToken> {
        try {
            if (!this.clientId || !this.clientSecret) {
                logger.warn('SWUStatsHandler: Cannot refresh token - OAuth credentials not configured or missing refreshToken');
                return null;
            }
            const formData = new URLSearchParams();
            formData.append('grant_type', 'refresh_token');
            formData.append('client_id', this.clientId);
            formData.append('client_secret', this.clientSecret);
            formData.append('refresh_token', refreshToken);

            const response = await fetch(this.tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`SWUStatsHandler: Token refresh failed: ${response.status} - ${errorText}`);
                return null;
            }
            const tokenResponse = await response.json() as OAuthTokenResponse;
            logger.info('SWUStatsHandler: Successfully refreshed access token');
            return {
                creationDateTime: new Date(),
                timeToLiveSeconds: tokenResponse.expires_in,
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
            };
        } catch (error) {
            logger.error('SWUStatsHandler: Failed to refresh access token', {
                error: { message: error.message, stack: error.stack },
            });
            return null;
        }
    }
}