import { logger } from '../logger';

// List of allowed user IDs for admin access - must match exactly what NextAuth provides
const allowedAdminUsers = [
    '4644b207-9307-4b78-8df7-69493f97c920', // ninin
];

export function isAdminUser(userId?: string | null): boolean {
    return Boolean(process.env.ENVIRONMENT === 'development' ||
      (userId && allowedAdminUsers.includes(userId)));
}

/**
 * Check if a user from JWT token has admin privileges
 */
export function checkAdminPrivileges(user: unknown): boolean {
    if (!user) {
        return false;
    }

    // Check if user has admin privileges using the user ID
    const userId = (user as any)?.id || (user as any)?.userId;
    const isAdmin = isAdminUser(userId);

    if (!isAdmin) {
        logger.warn(`Non-admin user ${userId || 'unknown'} attempted to access admin function`);
    }

    return isAdmin;
}