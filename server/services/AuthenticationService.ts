import { DynamoDBService } from '../services/DynamoDBService';
import jwt from 'jsonwebtoken';

export class AuthService {
    private dbService = new DynamoDBService();

    /**
     * Authenticate a user via JWT token
     * @param token JWT token
     * @returns The authenticated user or null if authentication failed
     */
    public async authenticateWithToken(token: string): Promise<{ id: string; username: string } | null> {
        if (!token) {
            return null;
        }

        const secret = process.env.NEXTAUTH_SECRET || '';

        try {
            const decoded = jwt.verify(token, secret) as any;

            if (!decoded || (!decoded.id && !decoded.sub)) {
                return null;
            }

            const userId = decoded.id || decoded.sub;
            const username = decoded.name || 'Anonymous';

            // Try to get the user from the database
            let user = await this.dbService.getUserById(userId);

            if (!user) {
                // Create a new user if not found
                const newUser = {
                    id: userId,
                    username: username,
                    email: decoded.email || null,
                    provider: decoded.provider || 'unknown',
                    avatarUrl: decoded.picture || null,
                    lastLogin: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    settings: { cardBack: 'default' }
                };
                await this.dbService.saveUser(newUser);
                user = newUser;
            } else {
                // Update login time
                await this.dbService.recordNewLogin(userId);
            }

            return {
                id: userId,
                username: username
            };
        } catch (error) {
            // This catches both JWT verification errors and database errors
            return null;
        }
    }

    /**
     * Get full user data for HTTP requests
     * @param userId The user ID
     * @returns Full user data object
     */
    public async getFullUserData(userId: string) {
        try {
            const user = await this.dbService.getUserById(userId);
            if (!user) {
                return null;
            }

            return {
                userId: user.id,
                username: user.username,
                email: user.email,
                provider: user.provider,
                image: user.avatarUrl
            };
        } catch (error) {
            return null;
        }
    }
}