import { logger } from '../logger';
import { ServerRole } from '../services/DynamoDBInterfaces';
import { getDynamoDbServiceAsync } from '../services/DynamoDBService';

async function isAdminAsync(userId: string): Promise<boolean> {
    const db = await getDynamoDbServiceAsync();
    const serverRoleUsers = await db.getServerRoleUsersAsync();

    return serverRoleUsers.admins.some((adminUserId) => adminUserId === userId);
}

async function isDeveloperAsync(userId: string): Promise<boolean> {
    const db = await getDynamoDbServiceAsync();
    const serverRoleUsers = await db.getServerRoleUsersAsync();

    return serverRoleUsers.developers.some((devUserId) => devUserId === userId);
}

async function isModeratorAsync(userId: string): Promise<boolean> {
    const db = await getDynamoDbServiceAsync();
    const serverRoleUsers = await db.getServerRoleUsersAsync();
    return serverRoleUsers.moderators.some((modUserId) => modUserId === userId);
}

interface IAuthResponse {
    success: boolean;
    message: string;
}

export const checkServerRoleUserPrivilegesAsync = async (
    apiPath: string,
    userId: string,
    role: ServerRole
): Promise<IAuthResponse> => {
    if (!userId) {
        return {
            success: false,
            message: 'Authentication required'
        };
    }

    try {
        switch (role) {
            case ServerRole.Admin:
                if (!await isAdminAsync(userId)) {
                    return {
                        success: false,
                        message: 'Admin privileges required'
                    };
                }
                break;
            case ServerRole.Developer:
                if (!await isAdminAsync(userId) && !await isDeveloperAsync(userId)) {
                    return {
                        success: false,
                        message: 'Developer privileges required'
                    };
                }
                break;
            case ServerRole.Moderator:
                if (!await isAdminAsync(userId) && !await isModeratorAsync(userId)) {
                    return {
                        success: false,
                        message: 'Moderator privileges required'
                    };
                }
                break;
        }

        return {
            success: true,
            message: 'User has required privileges'
        };
    } catch (error) {
        logger.error(`authUtils (checkServerRoleUserPrivilegesAsync) error for userId: ${userId} requesting path: ${apiPath}`, error);
        return {
            success: false,
            message: 'Error checking user privileges'
        };
    }
};
