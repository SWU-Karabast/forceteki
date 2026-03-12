import type { User } from './User';
import { AnonymousUser, AuthenticatedUser } from './User';
import { logger } from '../../logger';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import { getDynamoDbServiceAsync } from '../../services/DynamoDBService';
import * as Contract from '../../game/core/utils/Contract';
import type { ParsedUrlQuery } from 'node:querystring';
import type { IUserDataEntity, IUserPreferences, IUserProfileDataEntity, IModActionEntity, ModActionType } from '../../services/DynamoDBInterfaces';
import { ModerationFieldState, ModerationType } from '../../services/DynamoDBInterfaces';
import { RefreshTokenSource } from '../statHandlers/StatHandlerTypes';


const getDefaultSoundPreferences = () => ({
    muteAllSound: false,
    muteCardAndButtonClickSound: false,
    muteChatSound: false,
    muteYourTurn: false,
    muteOpponentFoundSound: false,
});

const getDefaultCosmeticsPreferences = () => ({
    cardback: null,
    background: null,
});

export const getDefaultPreferences = (): IUserPreferences => ({
    sound: getDefaultSoundPreferences(),
    cosmetics: getDefaultCosmeticsPreferences(),
});


const refreshTokenFieldMap: Record<RefreshTokenSource, {
    [K in keyof IUserDataEntity]: IUserDataEntity[K] extends string | undefined ? K : never;
}[keyof IUserDataEntity]> = {
    [RefreshTokenSource.SWUStats]: 'swuStatsRefreshToken',
    [RefreshTokenSource.SWUBase]: 'swubaseRefreshToken',
};


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
        return new AnonymousUser(id || uuid(), name || 'Anonymous', !!id);
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
                if (queryUser.username && !queryUser.username.toLowerCase().startsWith('anonymous')) {
                    logger.info(`Auth Anon-creation: creating user with id ${queryUser.id} with non-anonymous name ${queryUser.username}`, { userId: queryUser.id });
                }
                return new AnonymousUser(queryUser.id, queryUser.username, true);
            }
        }
        return new AnonymousUser(uuid(), 'AnonymousPlayer', false);
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

    public async setUndoPopupSeenStatus(userId: string): Promise<boolean> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);
            await dbService.updateUserProfileAsync(userId, {
                undoPopupSeenDate: new Date().toISOString()
            });
            return true;
        } catch (error) {
            logger.error('Error setting undoPopupSeen status:', { error: { message: error.message, stack: error.stack } });
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

            if (userProfile.mustRequestUsernameChange) {
                return {
                    canChange: false,
                    message: 'You must submit a ticket to request a username change.',
                    typeOfMessage: 'green',
                };
            }

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

            // Block free username changes if mustRequestUsernameChange is set
            if (userProfile.mustRequestUsernameChange) {
                return {
                    success: false,
                    message: 'You must submit a ticket to request a username change.'
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

            // update the GSI username
            await dbService.deleteUsernameLinkAsync(userProfile.username, userId);
            await dbService.saveUsernameLinkAsync(newUsername, userId);

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
                mustRequestUsernameChange: null,
                reportingDisabled: null,
                swuStatsRefreshToken: null,
                swubaseRefreshToken: null,
                moderation: null,
                undoPopupSeenDate: null,
            };

            // Create OAuth link
            await dbService.saveOAuthLinkAsync(provider, providerId, newUser.id);
            // Save the user profile
            await dbService.saveUserProfileAsync(newUser);
            // create username link
            await dbService.saveUsernameLinkAsync(newUser.username, newUser.id);
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
     * Add or update the SWUstats / SWUBase refresh token for a user.
     * - Calling again overwrites the old token.
     * - Does NOT return the token.
     */
    public async addRefreshTokenAsync(userId: string, refreshToken: string, source: RefreshTokenSource): Promise<void> {
        Contract.assertNotNullLike(userId, 'userId is required');
        Contract.assertTrue(!!refreshToken, 'refreshToken is required');
        try {
            const dbService = await this.dbServicePromise;
            await dbService.updateUserProfileAsync(userId, {
                [refreshTokenFieldMap[source]]: refreshToken,
            });
        } catch (error: any) {
            logger.error(`Error linking ${source} refresh token:`, {
                error: { message: error.message, stack: error.stack }, userId
            });
            throw error;
        }
    }

    /**
     * Fetches the SWUstats / SWUBase refresh token for a user
     * @returns The refresh token
     * @param userId a users id
     * @param source a source of the refresh token (SWUStats or SWUBase)
     */
    public async getUserRefreshTokenAsync(userId: string, source: RefreshTokenSource): Promise<string | null> {
        Contract.assertNotNullLike(userId, 'user is required');
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);

            if (!userProfile) {
                throw new Error(`No user profile found for userId ${userId}`);
            }
            return userProfile[refreshTokenFieldMap[source]];
        } catch (error: any) {
            logger.error(`Error refreshing user ${source} token:`, {
                error: { message: error.message, stack: error.stack },
                userId
            });
            throw error;
        }
    }

    /**
     * Remove the SWUstats / SWUBase refresh token (unlink account).
     */
    public async unlinkRefreshTokenAsync(userId: string, source: RefreshTokenSource): Promise<void> {
        Contract.assertTrue(!!userId, 'userId is required');

        try {
            const dbService = await this.dbServicePromise;
            await dbService.updateUserProfileAsync(userId, {
                [refreshTokenFieldMap[source]]: null,
            });
        } catch (error: any) {
            logger.error(`Error unlinking ${source}:`, {
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
    public async setMustRequestUsernameChangeSeenAsync(userId: string): Promise<boolean> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);

            if (userProfile.mustRequestUsernameChange === ModerationFieldState.Enabled) {
                await dbService.updateUserProfileAsync(userId, {
                    mustRequestUsernameChange: ModerationFieldState.EnabledAndSeen
                });

                logger.info(`UserFactory: Set mustRequestUsernameChange as seen for user ${userId}`, { userId });
                return true;
            }

            return false;
        } catch (error) {
            logger.error('Error setting mustRequestUsernameChange seen status:', {
                error: { message: error.message, stack: error.stack },
                userId
            });
            throw error;
        }
    }

    public async setReportingDisabledSeenAsync(userId: string): Promise<boolean> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);

            if (userProfile.reportingDisabled === ModerationFieldState.Enabled) {
                await dbService.updateUserProfileAsync(userId, {
                    reportingDisabled: ModerationFieldState.EnabledAndSeen
                });

                logger.info(`UserFactory: Set reportingDisabled as seen for user ${userId}`, { userId });
                return true;
            }

            return false;
        } catch (error) {
            logger.error('Error setting reportingDisabled seen status:', {
                error: { message: error.message, stack: error.stack },
                userId
            });
            throw error;
        }
    }

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

    // ------------------ MOD ACTIONS ------------------
    /**
     * Find user profile(s) by ID or username.
     * - If searchQuery matches a userId: returns a single profile.
     * - Otherwise tries username lookup: can return multiple profiles.
     * @returns Array of matching user profiles, or empty array if not found.
     */
    public async findUserProfilesAsync(searchQuery: string): Promise<IUserProfileDataEntity[]> {
        try {
            const dbService = await this.dbServicePromise;

            // Try direct lookup by userId first
            const directProfile = await dbService.getUserProfileAsync(searchQuery);
            if (directProfile) {
                return [directProfile];
            }

            // Fallback to username search
            const userIds = await dbService.getUserIdsByUsernameAsync(searchQuery);
            if (!userIds || userIds.length === 0) {
                return [];
            }

            const profiles: IUserProfileDataEntity[] = [];
            for (const userId of userIds) {
                const profile = await dbService.getUserProfileAsync(userId);
                if (profile) {
                    profiles.push(profile);
                }
            }

            return profiles;
        } catch (error) {
            logger.error('Error finding user profiles:', {
                error: { message: error.message, stack: error.stack },
            });
            throw error;
        }
    }

    /**
     * Get the full mod action history for a player (all actions, including cancelled/expired).
     * Sorted by createdAt descending (newest first).
     */
    public async getModActionHistoryAsync(userId: string): Promise<IModActionEntity[]> {
        try {
            const dbService = await this.dbServicePromise;
            const modActions = await dbService.getModActionsAsync({ userId });
            modActions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return modActions;
        } catch (error) {
            logger.error('Error getting mod action history:', {
                error: { message: error.message, stack: error.stack },
                userId
            });
            throw error;
        }
    }

    /**
     * Submit a new mod action against a player.
     * Verifies the target player exists, builds the entity, and saves to DynamoDB.
     * @returns The saved mod action entity.
     * @throws Error if the target player is not found.
     */
    public async submitModActionAsync(
        playerId: string,
        actionType: ModActionType,
        moderatorId: string,
        note: string,
        durationDays?: number,
    ): Promise<IModActionEntity> {
        try {
            const dbService = await this.dbServicePromise;

            // Verify target player exists
            const playerProfile = await dbService.getUserProfileAsync(playerId);
            Contract.assertNotNullLike(playerProfile, `Target player not found: ${playerId}`);

            const modAction: IModActionEntity = {
                id: uuid(),
                playerId,
                actionType,
                durationDays,
                note,
                moderatorId,
                createdAt: new Date().toISOString(),
            };

            await dbService.saveModActionAsync(modAction);

            logger.info(`UserFactory: Moderator ${moderatorId} issued ${actionType} on player ${playerId}`, {
                moderatorId,
                playerId,
                actionType,
                modActionId: modAction.id,
                durationDays: durationDays ?? null,
            });

            return modAction;
        } catch (error) {
            logger.error('Error submitting mod action:', {
                error: { message: error.message, stack: error.stack },
                userId: playerId,
                actionType,
            });
            throw error;
        }
    }

    /**
     * Cancel a mod action.
     * Sets cancelledAt/cancelledBy and removes it from the active index.
     * @throws Error if the mod action is not found.
     */
    public async cancelModActionAsync(playerId: string, modActionId: string, cancelledBy: string): Promise<void> {
        try {
            const dbService = await this.dbServicePromise;
            const result = await dbService.cancelModActionAsync(playerId, modActionId, cancelledBy);
            Contract.assertNotNullLike(result.Attributes, `Mod action not found: ${modActionId}`);

            logger.info(`UserFactory: Moderator ${cancelledBy} cancelled action ${modActionId} on player ${playerId}`, {
                moderatorId: cancelledBy,
                userId: playerId,
            });
        } catch (error) {
            logger.error('Error cancelling mod action:', {
                error: { message: error.message, stack: error.stack },
                userId: playerId,
            });
            throw error;
        }
    }
}