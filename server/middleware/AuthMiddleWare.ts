import type { Request, Response, NextFunction } from 'express';
import { parse } from 'cookie';
import { UserFactory } from '../utils/user/UserFactory';
import { logger } from '../logger';
import { type ServerRole } from '../services/DynamoDBInterfaces';
import { checkServerRoleUserPrivileges } from '../utils/authUtils';
import type { GameServer } from '../gamenode/GameServer';

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

export const authMiddleware = (gameServer: GameServer, routeName?: string, serverRoleRequired?: ServerRole) => {
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
                req.user = userFactory.verifyTokenAndCreateAuthenticatedUser(token, req.body.user);
            } else {
                req.user = await userFactory.createUserFromTokenAsync(token);
            }


            if (routeName) {
                logger.info(`Auth ${routeName}: finished authenticating user`, { userId: req.user.getId() });
            }

            if (serverRoleRequired) {
                const authResponse = checkServerRoleUserPrivileges(
                    req.path,
                    req.user.getId(),
                    serverRoleRequired,
                    gameServer.serverRoleUsersCache
                );

                if (!authResponse.success) {
                    logger.warn(`Auth ${routeName}: user ${req.user.getId()} lacks required role ${serverRoleRequired}`, { userId: req.user.getId() });
                    return res.status(403).json({ success: false, message: authResponse.message });
                }
                if (routeName) {
                    logger.info(`Auth ${routeName}: user ${req.user.getId()} has required role ${serverRoleRequired}`, { userId: req.user.getId() });
                }
            }

            return next();
        } catch (error) {
            logger.error('Error with authentication: ', { error: { message: error.message, stack: error.stack } });
            return res.status(401).json({ success: false, message: 'Authentication failed' });
        }
    };
};