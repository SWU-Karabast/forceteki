import { logger } from '../logger';
import { ServerRole } from '../services/DynamoDBInterfaces';
import type { ServerRoleUsersCache } from './ServerRoleUsersCache';

interface IAuthResponse {
    success: boolean;
    message: string;
}

export const checkServerRoleUserPrivileges = (
    apiPath: string,
    userId: string,
    role: ServerRole,
    cache: ServerRoleUsersCache
): IAuthResponse => {
    if (!userId) {
        return {
            success: false,
            message: 'Authentication required'
        };
    }

    try {
        switch (role) {
            case ServerRole.Admin:
                if (!cache.isAdmin(userId)) {
                    return {
                        success: false,
                        message: 'Admin privileges required'
                    };
                }
                break;
            case ServerRole.Developer:
                if (!cache.isAdmin(userId) && !cache.isDeveloper(userId)) {
                    return {
                        success: false,
                        message: 'Developer privileges required'
                    };
                }
                break;
            case ServerRole.Moderator:
                if (!cache.isAdmin(userId) && !cache.isModerator(userId)) {
                    return {
                        success: false,
                        message: 'Moderator privileges required'
                    };
                }
                break;
            case ServerRole.Contributor:
                if (!cache.isAdmin(userId) && !cache.isContributor(userId) && !cache.isDeveloper(userId) && !cache.isModerator(userId)) {
                    return {
                        success: false,
                        message: 'Contributor privileges required'
                    };
                }
        }

        return {
            success: true,
            message: 'User has required privileges'
        };
    } catch (error) {
        logger.error(`authUtils (checkServerRoleUserPrivileges) error for userId: ${userId} requesting path: ${apiPath}`, error);
        return {
            success: false,
            message: 'Error checking user privileges'
        };
    }
};
