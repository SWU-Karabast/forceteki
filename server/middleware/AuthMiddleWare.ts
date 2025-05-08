import type { Request, Response, NextFunction } from 'express';
import { parse } from 'cookie';
import { UserFactory } from '../utils/user/UserFactory';
import { logger } from '../logger';
import { AuthenticatedUser } from '../utils/user/User';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                username: string;
                email?: string;
                image?: string;
                provider?: string;
            };
        }
    }
}

export const authMiddleware = (routeName = null) => {
    const userFactory = new UserFactory();

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // If NextAuth is storing JWT in a cookie, it might be '__Secure-next-auth.session-token' or 'next-auth.session-token'.
            const cookies = parse(req.headers.cookie || '');
            const token = cookies['__Secure-next-auth.session-token'] || cookies['next-auth.session-token'];
            if (!token) {
                if (routeName) {
                    logger.info(`Auth ${routeName}: no token found in cookies. Proceeding with anonymous user`);
                }

                // No token found, so no user info. We let the request proceed with an attached anon user.
                req.user = userFactory.createAnonymousUserFromQuery(req.body);

                if (routeName) {
                    logger.info(`Auth ${routeName}: anonymous user created for id ${req.user.id}`);
                }

                return next();
            }

            if (routeName) {
                logger.info(`Auth ${routeName}: token found in cookies. Authenticating user.`);
            }
            if (req.body.user?.authenticated) {
                const userEntity = {
                    username: req.body.user.username,
                    id: req.body.user.id,
                    preferences: req.body.user.preferences,
                    welcomeMessageSeen: req.body.user.welcomeMessageSeen
                };
                req.user = new AuthenticatedUser(userEntity);
            } else {
                req.user = await userFactory.createUserFromTokenAsync(token);
            }


            if (routeName) {
                logger.info(`Auth ${routeName}: finished authenticating user`);
            }

            return next();
        } catch (error) {
            logger.error('Error with authentication: ', { error: { message: error.message, stack: error.stack } });
            return res.status(401).json({ success: false, message: 'Authentication failed' });
        }
    };
};