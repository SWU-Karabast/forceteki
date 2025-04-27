import type { User } from './User';
import { AuthenticatedUser, AnonymousUser } from './User';
import { logger } from '../../logger';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import { getDynamoDbServiceAsync } from '../../services/DynamoDBService';
import * as Contract from '../../game/core/utils/Contract';
import type { ParsedUrlQuery } from 'node:querystring';


/**
 * Factory class responsible for creating the appropriate User instance
 * based on authentication status and data
 */
export class UserFactory {
    private dbServicePromise = getDynamoDbServiceAsync();

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

            const userData = await dbService.getUserProfileAsync(basicUser.id);
            Contract.assertNotNullLike(userData, `User profile not found for authenticated user ${basicUser.id}`);

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

    public async canChangeUsernameAsync(userId: string): Promise<{
        canChange: boolean;
        message?: string;
        nextChangeAllowedAt?: string; // ISO timestamp when they can change again
    }> {
        try {
            const dbService = await this.dbServicePromise;
            const userProfile = await dbService.getUserProfileAsync(userId);
            Contract.assertNotNullLike(userProfile, `No user profile found for userId ${userId}`);

            const now = Date.now();

            // If the user has never changed their username before
            if (!userProfile.usernameLastUpdatedAt) {
                return {
                    canChange: true,
                    message: 'You can change your username',
                };
            }

            // User has changed username before
            const createdAt = new Date(userProfile.createdAt).getTime();
            const lastChange = new Date(userProfile.usernameLastUpdatedAt).getTime();

            // Check if we're within the first hour of account creation
            const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
            const isWithinFirstHour = hoursSinceCreation <= 1;

            if (isWithinFirstHour) {
                return {
                    canChange: true,
                    message: 'You can change your username',
                };
            }

            // If outside first hour, check the 4-month restriction
            const fourMonthsInMs = 4 * 30 * 24 * 60 * 60 * 1000; // 4 months in milliseconds
            const nextChangeAllowedAt = new Date(lastChange + fourMonthsInMs);
            const daysRemaining = Math.ceil((nextChangeAllowedAt.getTime() - now) / (1000 * 60 * 60 * 24));

            if (daysRemaining > 0) {
                return {
                    canChange: false,
                    message: `You can change your username again in ${daysRemaining} days`,
                    nextChangeAllowedAt: nextChangeAllowedAt.toISOString(),
                };
            }

            // Time restriction has passed, user can change username
            return {
                canChange: true,
                message: 'You can change your username',
            };
        } catch (error) {
            logger.error('Error checking username change eligibility:', { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

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

            // Check if this is the user's first username change timeframe
            if (userProfile.usernameLastUpdatedAt) {
                const createdAt = new Date(userProfile.createdAt).getTime();
                const lastChange = new Date(userProfile.usernameLastUpdatedAt).getTime();

                // Check if we're within the first hour of account creation
                const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
                const isWithinFirstHour = hoursSinceCreation <= 1;

                if (!isWithinFirstHour) {
                    // If outside first hour, apply the 4-month restriction
                    const fourMonthsInMs = 4 * 30 * 24 * 60 * 60 * 1000; // 4 months in milliseconds
                    const nextChangeAllowedAt = new Date(lastChange + fourMonthsInMs);
                    const daysRemaining = Math.ceil((nextChangeAllowedAt.getTime() - now) / (1000 * 60 * 60 * 24));

                    if (daysRemaining > 0) {
                        logger.error(`GameServer (change-username): User ${userId} must wait ${daysRemaining} more days before changing username again`);
                        return {
                            success: false,
                            message: `You can change your username again in ${daysRemaining} days ( on ${nextChangeAllowedAt.toISOString()})`,
                        };
                    }
                }
            }

            // Update username and set the timestamp
            await dbService.updateUserProfileAsync(userId, {
                username: newUsername,
                usernameLastUpdatedAt: new Date().toISOString()
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
     * @param preferences The updated preferences object
     * @returns True if update was successful
     */
    public async updateUserPreferencesAsync(userId: string, preferences: Record<string, any>): Promise<void> {
        try {
            const dbService = await this.dbServicePromise;
            await dbService.saveUserSettingsAsync(userId, preferences);
        } catch (error) {
            logger.error('Error updating user preferences:', { error: { message: error.message, stack: error.stack } });
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
            const newUser = {
                id: uuid(),
                username: username,
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                usernameSetAt: new Date().toISOString(),
                preferences: { cardback: null },
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
}