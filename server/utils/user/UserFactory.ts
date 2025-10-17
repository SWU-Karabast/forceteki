import type { User } from './User';
import { AnonymousUser, AuthenticatedUser } from './User';
import { logger } from '../../logger';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import { getDynamoDbServiceAsync } from '../../services/DynamoDBService';
import * as Contract from '../../game/core/utils/Contract';
import type { ParsedUrlQuery } from 'node:querystring';
import type {
    IUserDataEntity,
    IUserProfileDataEntity,
    UserPreferences
} from '../../services/DynamoDBInterfaces';
import {
    ModerationType
} from '../../services/DynamoDBInterfaces';


const getDefaultSoundPreferences = () => ({
    muteAllSound: false,
    muteCardAndButtonClickSound: false,
    muteChatSound: false,
    muteYourTurn: false,
    muteOpponentFoundSound: false,
});

const getDefaultPreferences = (): UserPreferences => ({
    cardback: null,
    sound: getDefaultSoundPreferences()
});


/**
 * Factory class responsible for creating the appropriate User instance
 * based on authentication status and data
 */
export class UserFactory {
    private dbServicePromise = getDynamoDbServiceAsync();
    private MS_PER_DAY = 24 * 60 * 60 * 1000;

    /**
     * Creates a user instance from a JWT token
     * @param token JWT token
     * @returns A Promise that resolves to a User instance (either Authenticated or Anonymous)
     */
    public async createUserFromTokenAsync(token: string): Promise<User> {
        try {
            const dbService = await this.dbServicePromise;
            const basicUser = await this.authenticateWithTokenAsync(token);
            Contract.assertNotNullLike(basicUser, 'Token authentication failed, User not found from token');

            let userData = await dbService.getUserProfileAsync(basicUser.id);
            Contract.assertNotNullLike(userData, `User profile not found for authenticated user ${basicUser.id}`);

            userData = await this.processModerationAsync(userData);

            return new AuthenticatedUser(userData);
        } catch (error) {
            logger.error('Error creating user from token:', { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

    /**
     * Creates an anonymous user with a generated ID or provided ID
     * @param id Optional ID for the anonymous user
     * @param name Optional name for the anonymous user
     * @returns An AnonymousUser instance
     */
    public createAnonymousUser(id?: string, name?: string): AnonymousUser {
        return new AnonymousUser(id || uuid(), name || 'Anonymous');
    }

    public createAnonymousUserFromQuery(query?: ParsedUrlQuery): AnonymousUser {
        if (query.user) {
            // Check if it's a string that needs parsing
            let queryUser;
            if (typeof query.user === 'string') {
                queryUser = JSON.parse(query.user);
            } else {
                queryUser = query.user;
            }
            if (queryUser) {
                return new AnonymousUser(queryUser.id, queryUser.username);
            }
        }
        return new AnonymousUser(uuid(), 'AnonymousPlayer');
    }

    public async setWelcomeMessageStatus(userId: string): Promise<boolean> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);
            await dbService.updateUserProfileAsync(userId, {
                showWelcomeMessage: false
            });
            return true;
        } catch (error) {
            logger.error('Error setting showWelcomeMessage status:', { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

    /**
     * • Unlimited username changes during the first week (7 days) after account creation.
     * • After that, a 1‑month (30‑days) cooldown between changes.
     */
    public async canChangeUsernameAsync(userId: string): Promise<{
        canChange: boolean;
        message?: string;
        nextChangeAllowedAt?: string; // ISO timestamp when they can change again
        typeOfMessage: string | null;
    }> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);

            if (userProfile.needsUsernameChange) {
                return {
                    canChange: true,
                    message: 'You are required to change your username.',
                    typeOfMessage: 'green',
                };
            }

            const now = Date.now();

            const createdAt = new Date(userProfile.createdAt).getTime();
            const lastChange = userProfile.usernameLastUpdatedAt
                ? new Date(userProfile.usernameLastUpdatedAt).getTime()
                : createdAt; // default to account creation if never changed

            const weekInMs = 7 * 24 * 60 * 60 * 1000;   // 7 days
            const monthInMs = 30 * 24 * 60 * 60 * 1000; // 30 days

            const isWithinFirstWeek = now - createdAt < weekInMs;

            // If inside first week always allowed
            if (isWithinFirstWeek) {
                return {
                    canChange: true,
                    message: 'You can change your username freely within the first week',
                    typeOfMessage: 'green'
                };
            }

            // Outside first week enforce 30‑day cooldown
            const nextChangeAllowedAtMs = lastChange + monthInMs;
            if (now < nextChangeAllowedAtMs) {
                const daysRemaining = Math.ceil((nextChangeAllowedAtMs - now) / (1000 * 60 * 60 * 24));
                return {
                    canChange: false,
                    message: `You can change your username again in ${daysRemaining} days`,
                    nextChangeAllowedAt: new Date(nextChangeAllowedAtMs).toISOString(),
                    typeOfMessage: null
                };
            }

            // Cooldown passed allowed
            return {
                canChange: true,
                message: 'You can change your username (available every 30 days)',
                typeOfMessage: 'yellow'
            };
        } catch (error: any) {
            logger.error('Error checking username change eligibility:', {
                error: { message: error.message, stack: error.stack }
            });
            throw error;
        }
    }

    /**
     * • Unlimited username changes during the first week (7 days) after account creation.
     * • After that, a 1‑month (30‑days) cooldown between changes.
     */
    public async changeUsernameAsync(userId: string, newUsername: string): Promise<{
        success: boolean;
        username?: string;
        message?: string;
        nextChangeAllowedAt?: string; // ISO timestamp when they can change again
        daysRemaining?: number;
    }> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);
            const now = Date.now();

            // Check if the new username is the same as the current one
            if (userProfile.username === newUsername) {
                return {
                    success: false,
                    message: 'The new username is the same as your current username.'
                };
            }
            const createdAt = new Date(userProfile.createdAt).getTime();
            const lastChange = userProfile.usernameLastUpdatedAt
                ? new Date(userProfile.usernameLastUpdatedAt).getTime()
                : createdAt; // default to createdAt if never changed

            const weekInMs = 7 * 24 * 60 * 60 * 1000;   // 7 days
            const monthInMs = 30 * 24 * 60 * 60 * 1000; // 30 days
            const isWithinFirstWeek = now - createdAt < weekInMs;

            // Check if this is the user's first username change timeframe
            // Outside the first week → enforce 1‑month cooldown
            const canBypassChangeRestriction = isWithinFirstWeek || userProfile.needsUsernameChange;
            if (!canBypassChangeRestriction) {
                const nextChangeAllowedAtMs = lastChange + monthInMs;
                if (now < nextChangeAllowedAtMs) {
                    const daysRemaining = Math.ceil((nextChangeAllowedAtMs - now) / (1000 * 60 * 60 * 24));
                    logger.error(`GameServer (change-username): User ${userId} must wait ${daysRemaining} more days before changing username again`);
                    return {
                        success: false,
                        message: `You can change your username again in ${daysRemaining} days (on ${new Date(nextChangeAllowedAtMs).toISOString()})`,
                        nextChangeAllowedAt: new Date(nextChangeAllowedAtMs).toISOString(),
                        daysRemaining
                    };
                }
            }

            // Update username and set the timestamp
            await dbService.updateUserProfileAsync(userId, {
                username: newUsername,
                usernameLastUpdatedAt: new Date().toISOString(),
                needsUsernameChange: false,
            });

            logger.info(`Username for ${userId} changed to ${newUsername}`);

            return {
                success: true,
                username: newUsername,
                message: 'Username successfully changed',
            };
        } catch (error) {
            logger.error('Error changing username:', { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

    /**
     * Update user preferences
     * @param userId The user ID
     * @param updatedPreferences The updated preferences object
     * @returns True if update was successful
     */
    public async updateUserPreferencesAsync(userId: string, updatedPreferences: Record<string, any>): Promise<void> {
        try {
            const dbService = await this.dbServicePromise;
            await dbService.updateUserPreferencesAsync(userId, updatedPreferences);
        } catch (error) {
            logger.error('Error updating user preferences:', { error: { message: error.message, stack: error.stack, userId: userId } });
            throw error;
        }
    }

    /**
     * Authenticate a user via JWT token
     * @param token JWT token
     * @returns The authenticated user or null if authentication failed
     */
    private async authenticateWithTokenAsync(token?: string): Promise<{ id: string; username: string } | null> {
        try {
            const dbService = await this.dbServicePromise;
            if (!token) {
                return null;
            }

            const secret = process.env.NEXTAUTH_SECRET;
            Contract.assertTrue(!!secret, 'NEXTAUTH_SECRET environment variable must be set and not empty for authentication to work');

            const decoded = jwt.verify(token, secret) as any;
            if (!decoded || (!decoded.id)) {
                return null;
            }
            const username = decoded.name;
            const email = decoded.email;
            const provider = decoded.provider;
            const providerId = decoded.providerId;

            // First try to find user by OAuth provider ID
            let dbUserId = await dbService.getUserIdByOAuthAsync(provider, providerId);
            // If not found by OAuth and email is available, try to find by email
            if (!dbUserId && email) {
                dbUserId = await dbService.getUserIdByEmailAsync(email);

                // If found user by email but not by OAuth, create the OAuth link
                if (dbUserId) {
                    logger.info(`User found by email ${email} but not by OAuth, creating OAuth link`);
                    await dbService.saveOAuthLinkAsync(provider, providerId, dbUserId);
                }
            }

            // If we found a user (by OAuth or email), get the profile and update login time
            if (dbUserId) {
                const userProfile = await dbService.getUserProfileAsync(dbUserId);
                if (userProfile) {
                    // Update the last login time
                    await dbService.recordNewLoginAsync(dbUserId);
                    return {
                        id: dbUserId,
                        username: userProfile.username
                    };
                }
            }

            // If the user ever finds himself in a weird state where the profile doesn't exist but a dbUserID does
            // we recreate a userProfile with a new id
            const cleanedUsername = username.trim()
                .replace(/\s+/g, '')
                .replace(/[^a-zA-Z0-9_]/g, '');
            const newUser = {
                id: uuid(),
                username: cleanedUsername,
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                usernameLastUpdatedAt: new Date().toISOString(),
                showWelcomeMessage: true,
                preferences: getDefaultPreferences(),
                needsUsernameChange: false,
                swuStatsRefreshToken: null,
                moderation: null
            };

            // Create OAuth link
            await dbService.saveOAuthLinkAsync(provider, providerId, newUser.id);
            // Save the user profile
            await dbService.saveUserProfileAsync(newUser);
            // Create email link if email is available
            if (!email) {
                throw new Error(`Email not found for user ${newUser.id}`);
            }
            await dbService.saveEmailLinkAsync(email, newUser.id);
            logger.info(`Created new user: ${newUser.id} (${username}) with ${provider} authentication`);
            return {
                id: newUser.id,
                username: newUser.username,
            };
        } catch (error) {
            // This should never happen but if it does its so we don't create two accounts
            if (error.name === 'ConditionalCheckFailedException') {
                // This could happen if there's a race condition while creating user records
                // or if the unique constraints we're enforcing are violated for other reasons
                logger.error('DynamoDB conditional check failed during user authentication: ', { error: { message: error.message, stack: error.stack } });
                throw error;
            }
            // This catches both JWT verification errors and database errors
            logger.error('Authentication error:', { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }


    /**
     * Verifies JWT token and creates an AuthenticatedUser from the provided user data
     * @param token JWT token to verify
     * @param userData User data to create the AuthenticatedUser with
     * @returns AuthenticatedUser instance if token is valid, null otherwise
     */
    public verifyTokenAndCreateAuthenticatedUser(token: string, userData: IUserDataEntity): AuthenticatedUser | AnonymousUser | null {
        try {
            const secret = process.env.NEXTAUTH_SECRET;
            Contract.assertTrue(!!secret, 'NEXTAUTH_SECRET environment variable must be set and not empty for authentication to work');

            const decoded = jwt.verify(token, secret) as any;
            if (!decoded.userId) {
                throw new Error('Parameter userId missing in JWT token');
            }

            // Update the user data with the decoded UUID
            const updatedUserData = {
                ...userData,
                id: decoded.userId
            };

            return new AuthenticatedUser(updatedUserData);
        } catch (error) {
            logger.error('Error verifying JWT token:', { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

    /**
     * Add or update the SWUstats refresh token for a user.
     * - Calling again overwrites the old token.
     * - Does NOT return the token.
     */
    public async addSwuStatsRefreshTokenAsync(userId: string, refreshToken: string): Promise<void> {
        Contract.assertNotNullLike(userId, 'userId is required');
        Contract.assertTrue(!!refreshToken, 'refreshToken is required');
        try {
            const dbService = await this.dbServicePromise;
            await dbService.updateUserProfileAsync(userId, {
                swuStatsRefreshToken: refreshToken,
            });
        } catch (error: any) {
            logger.error('Error linking SWUstats refresh token:', {
                error: { message: error.message, stack: error.stack }, userId
            });
            throw error;
        }
    }

    /**
     * Remove the SWUstats refresh token (unlink account).
     */
    public async unlinkSwuStatsAsync(userId: string): Promise<void> {
        Contract.assertTrue(!!userId, 'userId is required');

        try {
            const dbService = await this.dbServicePromise;
            await dbService.updateUserProfileAsync(userId, {
                swuStatsRefreshToken: null,
            });
        } catch (error: any) {
            logger.error('Error unlinking SWUstats:', {
                error: { message: error.message, stack: error.stack }, userId
            });
            throw error;
        }
    }

    /**
     * Processes moderation logic for a user
     * @param userData User data from database
     * @returns Updated user data with moderation processed
     */
    private async processModerationAsync(userData: IUserProfileDataEntity): Promise<IUserProfileDataEntity> {
        if (!userData.moderation || !userData.moderation.daysRemaining) {
            return userData;
        }
        try {
            const dbService = await this.dbServicePromise;
            Contract.assertNonNegative(userData.moderation.daysRemaining);
            // Check if user has moderation field and it's not null
            if (!userData.moderation.endDate) {
                userData.moderation = {
                    ...userData.moderation,
                    endDate: new Date(Date.now() + userData.moderation.daysRemaining * this.MS_PER_DAY).toISOString(),
                    hasSeen: false,
                    moderationType: ModerationType.Mute
                };
                // Update the user in the database with the new moderation data
                await dbService.updateUserProfileAsync(userData.id, {
                    moderation: userData.moderation
                });

                logger.info(`UserFactory: Initialized moderation end date ${userData.moderation.endDate} with days remaining ${userData.moderation.daysRemaining} for user ${userData.id}`, {
                    userId: userData.id
                });
                return userData;
            }

            // Check if moderation has expired
            const endDate = new Date(userData.moderation.endDate);
            const now = new Date();

            if (now > endDate) {
                userData.moderation = null;
                // Update the user in the database to remove moderation data
                await dbService.updateUserProfileAsync(userData.id, {
                    moderation: null
                });

                logger.info(`UserFactory: Cleared expired moderation for user ${userData.id}`, {
                    userId: userData.id,
                });
            }

            return userData;
        } catch (error) {
            logger.error('Error processing moderation for user:', {
                error: { message: error.message, stack: error.stack },
                userId: userData.id
            });
            throw error;
        }
    }

    /**
     * Updates moderation seen status for a user
     * @param userId The user ID
     * @returns True if update was successful
     */
    public async setModerationSeenAsync(userId: string): Promise<boolean> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);

            if (userProfile.moderation) {
                userProfile.moderation.hasSeen = true;
                await dbService.updateUserProfileAsync(userId, {
                    moderation: userProfile.moderation
                });

                logger.info(`UserFactory: Set moderation as seen for user ${userId}`, { userId: userId });
                return true;
            }

            return false;
        } catch (error) {
            logger.error('Error setting moderation seen status:', {
                error: { message: error.message, stack: error.stack },
                userId
            });
            throw error;
        }
    }
}