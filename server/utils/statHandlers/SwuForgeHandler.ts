import { logger } from '../../logger';
import type { GameServer, IToken } from '../../gamenode/GameServer';
import { type UserFactory } from '../user/UserFactory';
import { requireEnvVars } from '../../env';
import type { Game } from '../../game/core/Game';
import type { Player } from '../../game/core/Player';
import type { SwuGameFormat } from '../../game/core/Constants';
import { StatsMessageKey } from '../stats/statsMessages';
import type { IGameStatisticsTracker } from '../../gameStatistics/GameStatisticsTracker';
import { GameCardMetric } from '../../gameStatistics/GameStatisticsTracker';
import type { ICardMetrics, IOAuthTokenResponse } from './StatHandlerTypes';
import { RefreshTokenSource } from './StatHandlerTypes';

export class SwuForgeHandler {
    private readonly apiUrl: string;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly tokenUrl: string;
    private readonly revokeUrl: string;
    private readonly userFactory: UserFactory;

    public constructor(userFactory) {
        requireEnvVars([
            'SWUFORGE_CLIENT_ID',
            'SWUFORGE_CLIENT_SECRET'
        ], 'SWU Forge Handler');
        const baseUrl = process.env.SWUFORGE_API_URL || 'https://swuforge.com';
        this.apiUrl = `${baseUrl}/api/games/results`;
        this.tokenUrl = `${baseUrl}/auth/forceteki/token`;
        this.revokeUrl = `${baseUrl}/auth/forceteki/revoke`;
        this.clientId = process.env.SWUFORGE_CLIENT_ID;
        this.clientSecret = process.env.SWUFORGE_CLIENT_SECRET;
        this.userFactory = userFactory;
    }

    /**
     * Send game result to SWU Forge API
     * @param game The completed game
     * @param player1 player 1
     * @param player2 player 2
     * @param lobbyId the id of the lobby in string format
     * @param serverObject the server object from where we gain access to the user x accessToken
     * @param sequenceNumber number of a game in Bo3 (1,2 or 3), for Bo1 always 1
     * @param format
     * @returns Promise that resolves to a tuple of StatsMessageKey for each player
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
                logger.info(`SwuForgeHandler: No authenticated players with SWU Forge link for game ${game.id}, skipping sendGameResultAsync`, { lobbyId });
                return [null, null];
            }

            const payload = {
                gameId: game.id,
                lobbyId: lobbyId,
                startedAt: game.startedAt,
                finishedAt: game.finishedAt,
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
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`SWU Forge API returned error: ${response.status} - ${errorText}`);
            }
            logger.info(`SwuForgeHandler: Successfully sent game result to SWU Forge for game ${game.id}`, { lobbyId });
            return [p1AccessToken ? StatsMessageKey.SwuForgeSuccess : null, p2AccessToken ? StatsMessageKey.SwuForgeSuccess : null];
        } catch (error) {
            logger.error('SwuForgeHandler: Error sending game result', {
                error: { message: error.message, stack: error.stack },
                gameId: game.id,
                lobbyId: lobbyId
            });
            throw error;
        }
    }

    private buildPlayerData(player: Player, accessToken: string | null) {
        const { name, base, leader, deckSource, deckLink } = player.lobbyDeck;

        // Deck Links in the form: https://swuforge.com/decks/${deckId}
        const match = deckLink?.match(/\/decks\/([^/]+)\/?$/);
        const deckId = match ? match[1] : null;

        return {
            id: player.id,
            accessToken: accessToken,
            leader: player.leader?.id,
            base: player.base?.id,
            deck: {
                id: accessToken ? deckId : 'unknown',
                name,
                base,
                leader,
                deckSource,
            },
            isWinner: player.game.winnerNames.includes(player.name)
        };
    }

    private buildCardMetricsForPlayer(player: Player, cardMetrics: IGameStatisticsTracker['cardMetrics']) {
        const cardResultsByTrackingId = {} satisfies Record<string, ICardMetrics>;
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
     * Get access token for a player who has a refresh token
     * @param userId
     * @param serverObject
     * @param lobbyId
     * @returns Promise that resolves to an access token or null
     */
    public async getAccessTokenAsync(
        userId: string,
        serverObject: GameServer,
        lobbyId?: string,
    ): Promise<string | null> {
        let playerAccessToken = null;
        const playerTokenData = serverObject.swuForgeTokenMapping.get(userId);
        if (playerTokenData && this.isTokenValid(playerTokenData)) {
            playerAccessToken = playerTokenData.accessToken;
            logger.info(`SwuForgeHandler: Using existing valid access token for player (${userId})`, { lobbyId, userId });
        } else {
            logger.info(`SwuForgeHandler: Access token expired or missing for player (${userId}), attempting to refresh...`, lobbyId ? { lobbyId, userId } : { userId });
            const userRefreshToken = await this.userFactory.getUserRefreshTokenAsync(userId, RefreshTokenSource.SwuForge);
            if (!userRefreshToken) {
                logger.info(`SwuForgeHandler: Refresh token missing for player (${userId}), aborting refresh...`, lobbyId ? { lobbyId, userId } : { userId });
                return null;
            }
            const resultTokens = await this.refreshTokensAsync(userRefreshToken, userId);
            if (!resultTokens) {
                return null;
            }
            serverObject.swuForgeTokenMapping.set(userId, resultTokens);
            playerAccessToken = resultTokens.accessToken;
            await this.userFactory.addRefreshTokenAsync(userId, resultTokens.refreshToken, RefreshTokenSource.SwuForge);
        }
        return playerAccessToken;
    }

    /**
     * Check if an access token is still valid (not expired)
     * @param token The token to check
     * @returns True if token is valid, false if expired
     */
    public isTokenValid(token: IToken): boolean {
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
     * @returns Promise that resolves to a new IToken, or null if refresh failed
     */
    public async refreshTokensAsync(refreshToken: string, userId?: string): Promise<IToken> {
        try {
            if (!this.clientId || !this.clientSecret) {
                logger.warn('SwuForgeHandler: Cannot refresh token - OAuth credentials not configured');
                return null;
            }

            const response = await fetch(this.tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grant_type: 'refresh_token',
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    refresh_token: refreshToken,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`SwuForgeHandler(refreshTokensAsync): Token refresh failed: ${response.status} - ${errorText}`);
                return null;
            }
            const tokenResponse = await response.json() as IOAuthTokenResponse;
            logger.info('SwuForgeHandler: Successfully refreshed access token');
            return {
                creationDateTime: new Date(),
                timeToLiveSeconds: tokenResponse.expires_in,
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
            };
        } catch (error) {
            logger.error('SwuForgeHandler: Failed to refresh access token', {
                error: { message: error.message, stack: error.stack },
            });
            return null;
        }
    }

    /**
     * Exchange an authorization code for tokens (used during account linking)
     * @param code The authorization code from the OAuth flow
     * @param redirectUri The redirect URI used in the authorization request
     * @returns Promise that resolves to an IToken, or null if exchange failed
     */
    public async linkAccountAsync(code: string, redirectUri: string): Promise<IToken> {
        try {
            if (!this.clientId || !this.clientSecret) {
                logger.warn('SwuForgeHandler: Cannot link account - OAuth credentials not configured');
                return null;
            }

            const response = await fetch(this.tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grant_type: 'authorization_code',
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    code,
                    redirect_uri: redirectUri,
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`SwuForgeHandler(linkAccountAsync): Token exchange failed: ${response.status} - ${errorText}`);
                return null;
            }
            const tokenResponse = await response.json() as IOAuthTokenResponse;
            logger.info('SwuForgeHandler: Successfully linked account');
            return {
                creationDateTime: new Date(),
                timeToLiveSeconds: tokenResponse.expires_in,
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
            };
        } catch (error) {
            logger.error('SwuForgeHandler: Failed to link account', {
                error: { message: error.message, stack: error.stack },
            });
            return null;
        }
    }

    /**
     * Revoke tokens and unlink an SWU Forge account
     * @param userId
     */
    public async unlinkAccountAsync(userId: string): Promise<void> {
        try {
            if (!this.clientId || !this.clientSecret) {
                logger.warn('SwuForgeHandler: Cannot unlink account - clientId or clientSecret missing');
                return null;
            }

            const userRefreshToken = await this.userFactory.getUserRefreshTokenAsync(userId, RefreshTokenSource.SwuForge);
            if (!userRefreshToken) {
                logger.info('SwuForgeHandler: No refresh token found for user, skipping revoke');
                return;
            }

            const response = await fetch(this.revokeUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    token: userRefreshToken,
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`SwuForgeHandler: Account unlinking failed: ${response.status} - ${errorText}`);
                return;
            }
            logger.info('SwuForgeHandler: Successfully unlinked account');
        } catch (error) {
            logger.error('SwuForgeHandler: Failed to unlink account', {
                error: { message: error.message, stack: error.stack },
            });
            return null;
        }
    }
}
