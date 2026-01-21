import { logger } from '../../logger';
import type { GameServer, ISwuBaseToken } from '../../gamenode/GameServer';
import { RefreshTokenSource, type UserFactory } from '../user/UserFactory';
import { requireEnvVars } from '../../env';
import type Game from '../../game/core/Game';
import type { Player } from '../../game/core/Player';
import type { SwuGameFormat } from '../../game/core/Constants';
import { StatsMessageKey } from '../stats/statsMessages';
import type { IGameStatisticsTracker } from '../../gameStatistics/GameStatisticsTracker';
import { GameCardMetric } from '../../gameStatistics/GameStatisticsTracker';

interface OAuthTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
}

interface CardMetrics {
    played: number;
    resourced: number;
    activated: number;
    drawn: number;
    discarded: number;
}

export class SwuBaseHandler {
    private readonly apiUrl: string;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly tokenUrl: string;
    private readonly linkAccountUrl: string;
    private readonly unlinkAccountUrl: string;
    private readonly userFactory: UserFactory;

    public constructor(userFactory) {
        // Use environment variable for API URL, defaulting to the known endpoint
        requireEnvVars([
            'SWUBASE_CLIENT_ID',
            'SWUBASE_CLIENT_SECRET'
        ], 'SWUBase Handler');
        const baseUrl = process.env.NODE_ENV === 'development' && process.env.SWUBASE_LOCAL_DEV === 'true'
            ? 'http://localhost:5173'
            : 'https://swubase.com';
        this.apiUrl = `${baseUrl}/api/integration/karabast/game-result`;
        this.tokenUrl = `${baseUrl}/api/integration/refresh-token`;
        this.linkAccountUrl = `${baseUrl}/api/integration/link-confirm`;
        this.unlinkAccountUrl = `${baseUrl}/api/integration/unlink`;
        this.clientId = process.env.SWUBASE_CLIENT_ID;
        this.clientSecret = process.env.SWUBASE_CLIENT_SECRET;
        this.userFactory = userFactory;
    }

    /**
     * Send game result to SWUBase API
     * @param game The completed game
     * @param player1 player 1
     * @param player2 player 2
     * @param lobbyId the id of the lobby in string format
     * @param serverObject the server object from where we gain access to the user x accessToken
     * @param sequenceNumber number of a game in Bo3 (1,2 or 3), for Bo1 always 1
     * @param format
     * @returns Promise that resolves to true if successful, false otherwise
     */
    public async sendGameResultAsync(
        game: Game,
        player1: Player,
        player2: Player,
        lobbyId: string,
        serverObject: GameServer,
        sequenceNumber: number,
        format: SwuGameFormat,
    ): Promise<[StatsMessageKey | null, StatsMessageKey | null]> {
        try {
            const p1AccessToken = player1.lobbyUser.isAuthenticatedUser() ? await this.getAccessTokenAsync(player1.lobbyUser.getId(), serverObject, lobbyId) : null;
            const p2AccessToken = player2.lobbyUser.isAuthenticatedUser() ? await this.getAccessTokenAsync(player2.lobbyUser.getId(), serverObject, lobbyId) : null;

            if (!p1AccessToken && !p2AccessToken) {
                logger.info(`SWUBaseHandler: No authenticated players with SWUBase link for game ${game.id}, skipping sendGameResultAsync`, { lobbyId });
                return [null, null];
            }

            const payload = {
                gameId: game.id,
                lobbyId: lobbyId,
                startedAt: game.startedAt,
                finishedAt: game.finishedAt,
                winnerNames: game.winnerNames,
                roundNumber: game.roundNumber,
                sequenceNumber,
                format,
                players: [
                    {
                        data: this.buildPlayerData(player1, p1AccessToken),
                        cardMetrics: this.buildCardMetricsForPlayer(player1, game.statsTracker.cardMetrics),
                    },
                    {
                        data: this.buildPlayerData(player2, p2AccessToken),
                        cardMetrics: this.buildCardMetricsForPlayer(player2, game.statsTracker.cardMetrics),
                    },
                ],
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    integration: 'karabast',
                    client_id: process.env.SWUBASE_CLIENT_ID,
                    client_secret: process.env.SWUBASE_CLIENT_SECRET,
                    data: payload
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`SWUBase API returned error: ${response.status} - ${errorText}`);
            }
            logger.info(`SWUBaseHandler: Successfully sent game result to SWUBase for game ${game.id}`, { lobbyId });
            return [p1AccessToken ? StatsMessageKey.SwuBaseSuccess : null, p2AccessToken ? StatsMessageKey.SwuBaseSuccess : null];
        } catch (error) {
            logger.error('SWUBaseHandler: Error sending game result', {
                error: { message: error.message, stack: error.stack },
                gameId: game.id,
                lobbyId: lobbyId
            });
            throw error;
        }
    }

    private buildPlayerData(player: Player, accessToken: string | null) {
        const d = player.lobbyDeck;
        return {
            name: player.name,
            id: player.id,
            accessToken: accessToken,
            leader: player.leader?.id,
            base: player.base?.id,
            deck: {
                id: accessToken ? 'unknown' : d.id, // "unknown" deck ids for players NOT linked to swubase
                name: d.name,
                base: d.base,
                leader: d.leader,
                deckSource: d.deckSource,
            },
            isWinner: player.game.winnerNames.includes(player.name)
        };
    }


    private buildCardMetricsForPlayer(player: Player, cardMetrics: IGameStatisticsTracker['cardMetrics']) {
        const cardResultsByTrackingId = {} satisfies Record<string, CardMetrics>;
        for (const card of player.allCards) {
            if (cardResultsByTrackingId[card.trackingId]) {
                continue;
            }

            cardResultsByTrackingId[card.trackingId] = {
                played: 0,
                resourced: 0,
                activated: 0,
                drawn: 0,
                discarded: 0,
            };
        }

        cardMetrics.forEach((cardMetric) => {
            if (cardMetric.player === player.trackingId && cardResultsByTrackingId[cardMetric.card]) {
                const cardResult = cardResultsByTrackingId[cardMetric.card];
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
                        break;
                }
            }
        });

        return cardResultsByTrackingId;
    }

    /**
     * Get access tokens for players who have refresh tokens
     * @param userId
     * @param lobbyId
     * @param serverObject
     * @returns Promise that resolves to an access token for the player or null if no token and no refresh token is present.
     */
    public async getAccessTokenAsync(
        userId: string,
        serverObject: GameServer,
        lobbyId?: string,
    ): Promise<string | null> {
        let playerAccessToken = null;
        const playerTokenData = serverObject.swuBaseTokenMapping.get(userId);
        // Handle Player swu token
        if (playerTokenData && this.isTokenValid(playerTokenData)) {
            playerAccessToken = playerTokenData.accessToken;
            logger.info(`SWUBaseHandler: Using existing valid access token for player (${userId})`, { lobbyId, userId });
        } else {
            // Token is expired or doesn't exist, refresh it
            logger.info(`SWUBaseHandler: Access token expired or missing for player (${userId}), attempting to refreshing...`, lobbyId ? { lobbyId, userId } : { userId });
            const userRefreshToken = await this.userFactory.getUserRefreshTokenAsync(userId, RefreshTokenSource.SWUBase);
            if (!userRefreshToken) {
                logger.info(`SWUBaseHandler: Refresh token missing for player (${userId}), aborting refresh...`, lobbyId ? { lobbyId, userId } : { userId });
                return null;
            }
            const resultTokens = await this.refreshTokensAsync(userRefreshToken, userId);
            serverObject.swuBaseTokenMapping.set(userId, resultTokens);
            playerAccessToken = resultTokens.accessToken;
            await this.userFactory.addRefreshTokenAsync(userId, resultTokens.refreshToken, RefreshTokenSource.SWUBase);
        }
        return playerAccessToken;
    }

    /**
     * Check if an access token is still valid (not expired)
     * @param token The token to check
     * @returns True if token is valid, false if expired
     */
    public isTokenValid(token: ISwuBaseToken): boolean {
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
     * @param userId
     * @returns Promise that resolves to the new access token, or null if refresh failed
     */
    public async refreshTokensAsync(refreshToken: string, userId: string): Promise<ISwuBaseToken> {
        try {
            if (!this.clientId || !this.clientSecret) {
                logger.warn('SWUBaseHandler: Cannot refresh token - OAuth credentials not configured or missing refreshToken');
                return null;
            }

            const response = await fetch(this.tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    external_user_id: userId,
                    refresh_token: refreshToken,
                    integration: 'karabast'
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`SWUBaseHandler(refreshTokensAsync): Token refresh failed: ${response.status} - ${errorText}`);
                return null;
            }
            const tokenResponse = await response.json() as OAuthTokenResponse;
            logger.info('SWUBaseHandler: Successfully refreshed access token');
            return {
                creationDateTime: new Date(),
                timeToLiveSeconds: tokenResponse.expires_in,
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
            };
        } catch (error) {
            logger.error('SWUBaseHandler: Failed to refresh access token', {
                error: { message: error.message, stack: error.stack },
            });
            return null;
        }
    }

    /**
     * Refresh an access token using a refresh token
     * @returns Promise that resolves to the new access token, or null if refresh failed
     * @param linkToken
     * @param userId
     */
    public async linkAccountAsync(linkToken: string, userId: string): Promise<ISwuBaseToken> {
        try {
            if (!this.clientId || !this.clientSecret) {
                logger.warn('SWUBaseHandler: Cannot refresh token - OAuth credentials not configured or missing refreshToken');
                return null;
            }

            const response = await fetch(this.linkAccountUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    link_token: linkToken,
                    external_user_id: userId,
                    integration: 'karabast'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`SWUBaseHandler(linkAccountAsync): Token refresh failed: ${response.status} - ${errorText}`);
                return null;
            }
            const tokenResponse = await response.json() as OAuthTokenResponse;
            logger.info('SWUBaseHandler: Successfully refreshed access token');
            return {
                creationDateTime: new Date(),
                timeToLiveSeconds: tokenResponse.expires_in,
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
            };
        } catch (error) {
            logger.error('SWUBaseHandler: Failed to refresh access token', {
                error: { message: error.message, stack: error.stack },
            });
            return null;
        }
    }

    /**
     * Unlink a SWUBase account
     * @returns Promise void
     * @param userId
     */
    public async unlinkAccountAsync(userId: string): Promise<void> {
        try {
            if (!this.clientId || !this.clientSecret) {
                logger.warn('SWUBaseHandler: Cannot unlink account - clientId or clientSecret missing');
                return null;
            }

            const response = await fetch(this.unlinkAccountUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    external_user_id: userId,
                    integration: 'karabast'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`SWUBaseHandler: Account unlinking failed: ${response.status} - ${errorText}`);
                return;
            }
            await response.json();
            logger.info('SWUBaseHandler: Successfully unlinked account');
            return;
        } catch (error) {
            logger.error('SWUBaseHandler: Failed to unlink account', {
                error: { message: error.message, stack: error.stack },
            });
            return null;
        }
    }
}