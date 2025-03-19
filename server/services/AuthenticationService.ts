import { DynamoDBService } from './DynamoDBService';
import jwt from 'jsonwebtoken';
import { logger } from '../logger';
import { v4 as uuid } from 'uuid';


export class AuthService {
    private dbService: DynamoDBService;
    private static instance: AuthService;

    // Singleton pattern
    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    private constructor() {
        // Use the singleton instance of DynamoDBService
        this.dbService = DynamoDBService.getInstance();
    }

    /**
     * Authenticate a user via JWT token
     * @param token JWT token
     * @returns The authenticated user or null if authentication failed
     */
    public async authenticateWithToken(token: string): Promise<{ id: string; username: string } | null> {
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
            let dbUserId = await this.dbService.getUserIdByOAuth(provider, providerId);
            // If not found by OAuth and email is available, try to find by email
            if (!dbUserId && email) {
                dbUserId = await this.dbService.getUserIdByEmail(email);

                // If found user by email but not by OAuth, create the OAuth link
                if (dbUserId) {
                    logger.info(`User found by email ${email} but not by OAuth, creating OAuth link`);
                    await this.dbService.saveOAuthLink(provider, providerId, dbUserId);
                }
            }

            // If we found a user (by OAuth or email), get the profile and update login time
            if (dbUserId) {
                const userProfile = await this.dbService.getUserProfile(dbUserId);
                if (userProfile) {
                    // Update the last login time
                    await this.dbService.recordNewLogin(dbUserId);
                    return {
                        id: dbUserId,
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
                username_set_at: new Date().toISOString(),
                preferences: { cardback: 'default' },
            };

            // Save the user profile
            await this.dbService.saveUserProfile(newUser);

            // Create OAuth link
            await this.dbService.saveOAuthLink(provider, providerId, newUser.id);

            // Create email link if email is available
            if (email) {
                await this.dbService.saveEmailLink(email, newUser.id);
            }

            logger.info(`Created new user: ${newUser.id} (${username}) with ${provider} authentication`);

            return {
                id: newUser.id,
                username: newUser.username
            };
        } catch (error) {
            // This catches both JWT verification errors and database errors
            logger.error('Authentication error:', error);
            return null;
        }
    }


    public async getUserProfile(userId: string) {
        return await this.dbService.getUserProfile(userId);
    }

    /**
     * Change username with rate limiting (30 days)
     * @param userId The user ID
     * @param newUsername The new username
     * @returns Object with success status and message
     */
    public async changeUsername(userId: string, newUsername: string): Promise<{ success: boolean; message: string }> {
        try {
            const userProfile = await this.dbService.getUserProfile(userId);
            if (!userProfile) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            // Check if username was changed recently (within the last 30 days)
            if (userProfile.username_set_at) {
                const lastChange = new Date(userProfile.username_set_at).getTime();
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
            await this.dbService.updateUserProfile(userId, {
                username: newUsername,
                username_set_at: new Date().toISOString()
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
            await this.dbService.saveUserSettings(userId, preferences);
            return true;
        } catch (error) {
            logger.error('Error updating user preferences:', error);
            return false;
        }
    }
}