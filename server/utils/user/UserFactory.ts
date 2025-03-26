import type { User } from './User';
import { AuthenticatedUser, AnonymousUser } from './User';
import { logger } from '../../logger';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import { dynamoDbService } from '../../services/DynamoDBService';


/**
 * Factory class responsible for creating the appropriate User instance
 * based on authentication status and data
 */
export class UserFactory {
    private dynamoDbService: typeof dynamoDbService;
    private static instance: UserFactory;

    // Singleton pattern
    public static getInstance(): UserFactory {
        if (!UserFactory.instance) {
            UserFactory.instance = new UserFactory();
        }
        return UserFactory.instance;
    }

    private constructor() {
        this.dynamoDbService = dynamoDbService;
    }

    /**
     * Creates a user instance from a JWT token
     * @param token JWT token
     * @returns A Promise that resolves to a User instance (either Authenticated or Anonymous)
     */
    public async createUserFromToken(token: string): Promise<User> {
        try {
            const basicUser = await this.authenticateWithToken(token);
            if (!basicUser) {
                logger.info('Token authentication failed, creating anonymous user');
                return this.createAnonymousUser();
            }

            const userData = await this.dynamoDbService.getUserProfile(basicUser.id);
            if (!userData) {
                logger.warn(`User profile not found for authenticated user ${basicUser.id}`);
                return this.createAnonymousUser();
            }
            return new AuthenticatedUser({ ...userData, playerId: basicUser.playerId });
        } catch (error) {
            logger.error('Error creating user from token:', error);
            return this.createAnonymousUser();
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

    /**
     * Change username with rate limiting (30 days)
     * @param userId The user ID
     * @param newUsername The new username
     * @returns Object with success status and message
     */
    public async changeUsername(userId: string, newUsername: string): Promise<{ success: boolean; message: string }> {
        try {
            const userProfile = await this.dynamoDbService.getUserProfile(userId);
            if (!userProfile) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            // Check if username was changed recently (within the last 30 days)
            if (userProfile.usernameSetAt) {
                const lastChange = new Date(userProfile.usernameSetAt).getTime();
                const now = Date.now();
                const daysSinceLastChange = (now - lastChange) / (1000 * 60 * 60 * 24);

                // If changed within the last 30 days, don't allow another change
                if (daysSinceLastChange < 30) {
                    const daysRemaining = Math.ceil(30 - daysSinceLastChange);
                    return {
                        success: false,
                        message: `Username can only be changed once every 30 days. You can change again in ${daysRemaining} days.`
                    };
                }
            }

            // Update username and set the timestamp
            await this.dynamoDbService.updateUserProfile(userId, {
                username: newUsername,
                usernameSetAt: new Date().toISOString()
            });

            logger.info(`Username for ${userId} changed to ${newUsername}`);
            return {
                success: true,
                message: 'Username successfully updated'
            };
        } catch (error) {
            logger.error('Error changing username:', error);
            return {
                success: false,
                message: 'An error occurred while updating username'
            };
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
    private async authenticateWithToken(token: string): Promise<{ id: string; username: string; playerId: string } | null> {
        try {
            if (!token) {
                return null;
            }

            const secret = process.env.NEXTAUTH_SECRET || '';


            const decoded = jwt.verify(token, secret) as any;

            if (!decoded || (!decoded.id && !decoded.sub)) {
                return null;
            }

            const userId = decoded.id || decoded.sub;
            const username = decoded.name || 'Anonymous';
            const email = decoded.email;
            const provider = decoded.provider || 'unknown';
            const providerId = decoded.providerId || userId;

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
                        playerId: userId,
                        username: userProfile.username
                    };
                }
            }

            // If user not found, create a new one
            const newUser = {
                id: uuid(),
                username: username,
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                usernameSetAt: new Date().toISOString(),
                preferences: { cardback: 'default' },
            };

            // Create OAuth link
            await this.dynamoDbService.saveOAuthLink(provider, providerId, newUser.id);

            // Save the user profile
            await this.dynamoDbService.saveUserProfile(newUser);


            // Create email link if email is available
            if (email) {
                await this.dynamoDbService.saveEmailLink(email, newUser.id);
            }

            logger.info(`Created new user: ${newUser.id} (${username}) with ${provider} authentication`);

            return {
                id: newUser.id,
                username: newUser.username,
                playerId: userId
            };
        } catch (error) {
            // This should never happen but if it does its so we don't create two accounts
            if (error.name === 'ConditionalCheckFailedException') {
                logger.info('Concurrent user creation detected');
                return null;
            }
            // This catches both JWT verification errors and database errors
            logger.error('Authentication error:', error);
            return null;
        }
    }
}