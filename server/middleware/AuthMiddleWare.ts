import type { Request, Response, NextFunction } from 'express';
import { DynamoDBService } from '../services/DynamoDBService';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

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
    const dbService = new DynamoDBService();

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // If NextAuth is storing JWT in a cookie, it might be '__Secure-next-auth.session-token' or 'next-auth.session-token'.
            const cookies = parse(req.headers.cookie || '');
            const token = cookies['__Secure-next-auth.session-token'] || cookies['next-auth.session-token'];
            if (!token) {
                // No token found, so no user info. We let the request proceed without an attached user.
                return next();
            }
            const secret = process.env.NEXTAUTH_SECRET || '';
            const decoded = jwt.verify(token, secret) as any;
            let user = await dbService.getUserById(decoded.id);

            if (!user) {
                const newUser = {
                    id: decoded.id,
                    username: decoded.name,
                    email: decoded.email || null,
                    provider: decoded.provider || 'unknown',
                    avatarUrl: decoded.picture || null,
                    lastLogin: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    settings: { cardBack: 'default' }
                };
                await dbService.saveUser(newUser);
                user = newUser;
            } else {
                await dbService.updateUserLogin(user.id);
            }

            // 6. Attach the user data to the request for downstream routes
            req.user = {
                userId: user.id,
                username: user.username,
                email: user.email,
                provider: user.provider,
                image: user.avatarUrl
            };
        } catch (error) {
            console.error('Auth middleware error:', error);
        }

        // 7. Continue to the next middleware or route
        return next();
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