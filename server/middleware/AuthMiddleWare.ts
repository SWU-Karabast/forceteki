import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../logger';
import { DynamoDBService } from '../services/DynamoDBService';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                username: string;
                provider?: string;
            };
        }
    }
}

interface NextAuthToken {
    name: string;
    email?: string;
    picture?: string;
    sub: string;
    id: string;
    provider: string;
    providerId: string;
    iat: number;
    exp: number;
    jti: string;
}

export const nextAuthMiddleware = () => {
    const dbService = new DynamoDBService();

    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get the token from the Authorization header
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return next(); // No token, continue without authenticated user
            }

            const token = authHeader.split(' ')[1];

            if (!token) {
                return next(); // No token, continue without authenticated user
            }

            // Verify the token
            // This should match the NEXTAUTH_SECRET from your Next.js app
            const secret = process.env.NEXTAUTH_SECRET || 'your-nextauth-secret';

            try {
                const decoded = jwt.verify(token, secret) as NextAuthToken;

                // Next-auth tokens use 'sub' as the subject identifier
                // It also contains 'id' which is provider-prefixed
                // We'll use the 'id' field which follows our convention
                if (decoded && decoded.id) {
                    // Attach the user to the request
                    req.user = {
                        userId: decoded.id,
                        username: decoded.name,
                        provider: decoded.provider
                    };
                }
            } catch (jwtError) {
                logger.warn('Invalid JWT token:', jwtError);
                // Don't block the request, just continue without authenticated user
            }

            next();
        } catch (error) {
            logger.error('Auth middleware error:', error);
            // Don't return an error, just continue without authenticated user
            next();
        }
    };
};

// Middleware to require authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    next();
};