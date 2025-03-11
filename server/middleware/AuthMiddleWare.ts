import type { Request, Response, NextFunction } from 'express';
import { DynamoDBService } from '../services/DynamoDBService';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                username: string;
                provider?: string;
                email?: string;
                image?: string;
            };
        }
    }
}

export const authMiddleware = () => {
    const dbService = new DynamoDBService();

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user ID from custom header
            const userId = req.headers['x-user-id'];

            if (userId && typeof userId === 'string') {
                // Check if user exists in database
                const user = await dbService.getUserById(userId);

                if (user) {
                    // Attach user to request
                    req.user = {
                        userId: user.id,
                        username: user.username,
                        email: user.email,
                        image: user.avatarUrl,
                        provider: user.provider
                    };
                }
            }

            // Always continue to next middleware
            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
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