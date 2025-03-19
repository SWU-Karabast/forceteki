import type { User } from './User';
import { AuthenticatedUser, AnonymousUser } from './User';
import { AuthService } from '../../services/AuthenticationService';
import { logger } from '../../logger';
import { v4 as uuid } from 'uuid';

/**
 * Factory class responsible for creating the appropriate User instance
 * based on authentication status and data
 */
export class UserFactory {
    private authService: AuthService;
    private static instance: UserFactory;

    // Singleton pattern
    public static getInstance(): UserFactory {
        if (!UserFactory.instance) {
            UserFactory.instance = new UserFactory();
        }
        return UserFactory.instance;
    }

    private constructor() {
        this.authService = AuthService.getInstance();
    }

    /**
     * Creates a user instance from a JWT token
     * @param token JWT token
     * @returns A Promise that resolves to a User instance (either Authenticated or Anonymous)
     */
    public async createUserFromToken(token: string): Promise<User> {
        try {
            const basicUser = await this.authService.authenticateWithToken(token);
            if (!basicUser) {
                logger.info('Token authentication failed, creating anonymous user');
                return this.createAnonymousUser();
            }

            const userData = await this.authService.getUserProfile(basicUser.id);
            if (!userData) {
                logger.warn(`User profile not found for authenticated user ${basicUser.id}`);
                return this.createAnonymousUser();
            }

            return new AuthenticatedUser(userData);
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
}