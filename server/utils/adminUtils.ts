import { AdminRole } from '../services/DynamoDBInterfaces';
import { getDynamoDbServiceAsync } from '../services/DynamoDBService';

async function isAdminAsync(userId: string): Promise<boolean> {
    const db = await getDynamoDbServiceAsync();
    const adminUsers = await db.getAdminUsersAsync();

    return adminUsers.admin.some((adminUserId) => adminUserId === userId);
}

async function isDeveloperAsync(userId: string): Promise<boolean> {
    const db = await getDynamoDbServiceAsync();
    const adminUsers = await db.getAdminUsersAsync();

    return adminUsers.dev.some((devUserId) => devUserId === userId);
}

async function isModeratorAsync(userId: string): Promise<boolean> {
    const db = await getDynamoDbServiceAsync();
    const adminUsers = await db.getAdminUsersAsync();
    return adminUsers.mod.some((modUserId) => modUserId === userId);
}

interface IAuthError {
    status: number;
    error: string;
}

export const checkAdminUserPrivilegesAsync = async (userId: string, role: AdminRole): Promise<IAuthError | null> => {
    if (!userId) {
        return {
            status: 401,
            error: 'Authentication required'
        };
    }

    switch (role) {
        case AdminRole.Admin:
            if (!await isAdminAsync(userId)) {
                return {
                    status: 403,
                    error: 'Admin privileges required'
                };
            }
            break;
        case AdminRole.Developer:
            if (!await isAdminAsync(userId) && !await isDeveloperAsync(userId)) {
                return {
                    status: 403,
                    error: 'Developer privileges or higher required'
                };
            }
            break;
        case AdminRole.Moderator:
            if (!await isAdminAsync(userId) && !await isDeveloperAsync(userId) && !await isModeratorAsync(userId)) {
                return {
                    status: 403,
                    error: 'Moderator privileges or higher required'
                };
            }
            break;
    }

    return null;
};
