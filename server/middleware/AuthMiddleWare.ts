import type { Request, Response, NextFunction } from 'express';
import { parse } from 'cookie';
import { AuthService } from '../services/AuthenticationService';

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
    const authService = new AuthService();

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // If NextAuth is storing JWT in a cookie, it might be '__Secure-next-auth.session-token' or 'next-auth.session-token'.
            const cookies = parse(req.headers.cookie || '');
            const token = cookies['__Secure-next-auth.session-token'] || cookies['next-auth.session-token'];
            if (!token) {
                // No token found, so no user info. We let the request proceed without an attached user.
                return next();
            }
            const basicUser = await authService.authenticateWithToken(token);
            if (!basicUser) {
                return res.status(401).json({ error: 'Authentication failed' });
            }

            // Get full user data for HTTP requests
            const fullUser = await authService.getFullUserData(basicUser.id);
            if (fullUser) {
                req.user = fullUser;
            }

            return next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(401).json({ error: 'Authentication failed' });
        }
    };
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    next();
};