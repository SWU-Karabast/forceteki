import { logger } from '../../logger';
import type { IDecklistInternal } from '../deck/DeckInterfaces';
import type { GameServer, ISwuBaseToken } from '../../gamenode/GameServer';
import { RefreshTokenSource, type UserFactory } from '../user/UserFactory';
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

interface SWUBaseGameResult {
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
    p1SWUBaseToken: string;
    p2SWUBaseToken: string;
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
        this.apiUrl = 'https://swubase.com/api/integration/karabast/game-result';
        this.tokenUrl = 'https://swubase.com/api/integration/token';
        this.linkAccountUrl = 'https://swubase.com/api/integration/link-confirm';
        this.unlinkAccountUrl = 'https://swubase.com/api/integration/unlink';
        this.clientId = process.env.SWUBASE_CLIENT_ID;
        this.clientSecret = process.env.SWUBASE_CLIENT_SECRET;
        this.userFactory = userFactory;
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
                logger.error(`SWUBaseHandler: Token refresh failed: ${response.status} - ${errorText}`);
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
                logger.error(`SWUBaseHandler: Token refresh failed: ${response.status} - ${errorText}`);
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