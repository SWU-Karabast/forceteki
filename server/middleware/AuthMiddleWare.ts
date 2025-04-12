import type { Request, Response, NextFunction } from 'express';
import { parse } from 'cookie';
import { UserFactory } from '../utils/user/UserFactory';
import {logger} from "../logger";

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

export const authMiddleware = () => {
    const userFactory = new UserFactory();

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // If NextAuth is storing JWT in a cookie, it might be '__Secure-next-auth.session-token' or 'next-auth.session-token'.
            const cookies = parse(req.headers.cookie || '');
            const token = cookies['__Secure-next-auth.session-token'] || cookies['next-auth.session-token'];
            if (!token) {
                // No token found, so no user info. We let the request proceed with an attached anon user.
                req.user = userFactory.createAnonymousUserFromQuery(req.body);
                return next();
            }

            req.user = await userFactory.createUserFromTokenAsync(token);
            return next();
        } catch (error) {
            logger.error('Error with authentication: ', { error: { message: error.message, stack: error.stack } });
            return res.status(401).json({ success: false, message: 'Authentication failed' });
        }
    };
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.isAuthenticatedUser()) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    next();
};

// TODO this will be needed later on when we will have dedicated admin pages
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.isAuthenticatedUser() || !req.user.isAdmin()) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};