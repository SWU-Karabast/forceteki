import type { User } from './User';
import { AuthenticatedUser, AnonymousUser } from './User';
import { logger } from '../../logger';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import { dynamoDbService } from '../../services/DynamoDBService';
import * as Contract from '../../game/core/utils/Contract';
import type { ParsedUrlQuery } from 'node:querystring';


/**
 * Factory class responsible for creating the appropriate User instance
 * based on authentication status and data
 */
export class UserFactory {
    private dynamoDbService: typeof dynamoDbService = dynamoDbService;

    /**
     * Creates a user instance from a JWT token
     * @param token JWT token
     * @returns A Promise that resolves to a User instance (either Authenticated or Anonymous)
     */
    public async createUserFromToken(token: string): Promise<User> {
        try {
            const basicUser = await this.authenticateWithToken(token);
            if (!basicUser) {
                logger.error('Token authentication failed');
                throw new Error('User not found from token');
            }

            const userData = await this.dynamoDbService.getUserProfile(basicUser.id);
            if (!userData) {
                logger.error(`User profile not found for authenticated user ${basicUser.id}`);
                throw new Error(`User profile not found for authenticated user ${basicUser.id}`);
            }
            return new AuthenticatedUser(userData);
        } catch (error) {
            logger.error('Error creating user from token:', error);
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

    /**
     * TODO Change username with rate limiting (30 days) change the rate limit
     * @param userId The user ID
     * @param newUsername The new username
     * @returns Object with success status and message
     */
    public async changeUsername(userId: string, newUsername: string): Promise<boolean> {
        try {
            const userProfile = await this.dynamoDbService.getUserProfile(userId);
            if (!userProfile) {
                return false;
            }
            // Check if username was changed recently (within the last 30 days)
            if (userProfile.usernameLastUpdatedAt) {
                const lastChange = new Date(userProfile.usernameLastUpdatedAt).getTime();
                const now = Date.now();
                const daysSinceLastChange = (now - lastChange) / (1000 * 60 * 60 * 24);

                // If changed within the last 30 days, don't allow another change
                if (daysSinceLastChange < 30) {
                    const daysRemaining = Math.ceil(30 - daysSinceLastChange);
                    return false;
                }
            }

            // Update username and set the timestamp
            await this.dynamoDbService.updateUserProfile(userId, {
                username: newUsername,
                usernameLastUpdatedAt: new Date().toISOString()
            });

            logger.info(`Username for ${userId} changed to ${newUsername}`);
            return true;
        } catch (error) {
            logger.error('Error changing username:', error);
            return false;
        }
    }

    /**
     * Update user preferences
     * @param userId The user ID
     * @param preferences The updated preferences object
     * @returns True if update was successful
     */
    public async updateUserPreferences(userId: string, preferences: Record<string, any>): Promise<boolean> {
        try {
            await this.dynamoDbService.saveUserSettings(userId, preferences);
            return true;
        } catch (error) {
            logger.error('Error updating user preferences:', error);
            return false;
        }
    }

    /**
     * Authenticate a user via JWT token
     * @param token JWT token
     * @returns The authenticated user or null if authentication failed
     */
    private async authenticateWithToken(token?: string): Promise<{ id: string; username: string } | null> {
        try {
            if (!token) {
                return null;
            }

            const secret = process.env.NEXTAUTH_SECRET;
            Contract.assertTrue(!!secret, 'NEXTAUTH_SECRET environment variable must be set and not empty for authentication to work');

            const decoded = jwt.verify(token, secret) as any;
            if (!decoded || (!decoded.id)) {
                return null;
            }

            const userId = decoded.id;
            const username = decoded.name;
            const email = decoded.email;
            const provider = decoded.provider;
            const providerId = decoded.providerId;

            // First try to find user by OAuth provider ID
            let dbUserId = await this.dynamoDbService.getUserIdByOAuth(provider, providerId);
            // If not found by OAuth and email is available, try to find by email
            if (!dbUserId && email) {
                dbUserId = await this.dynamoDbService.getUserIdByEmail(email);

                // If found user by email but not by OAuth, create the OAuth link
                if (dbUserId) {
                    logger.info(`User found by email ${email} but not by OAuth, creating OAuth link`);
                    await this.dynamoDbService.saveOAuthLink(provider, providerId, dbUserId);
                }
            }

            // If we found a user (by OAuth or email), get the profile and update login time
            if (dbUserId) {
                const userProfile = await this.dynamoDbService.getUserProfile(dbUserId);
                if (userProfile) {
                    // Update the last login time
                    await this.dynamoDbService.recordNewLogin(dbUserId);
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
            await this.dynamoDbService.saveOAuthLink(provider, providerId, newUser.id);
            // Save the user profile
            await this.dynamoDbService.saveUserProfile(newUser);
            // Create email link if email is available
            if (!email) {
                throw new Error(`Email not found for user ${newUser.id}`);
            }
            await this.dynamoDbService.saveEmailLink(email, newUser.id);
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
                logger.error(`DynamoDB conditional check failed during user authentication: ${error}`);
                return null;
            }
            // This catches both JWT verification errors and database errors
            logger.error('Authentication error:', error);
            return null;
        }
    }
}