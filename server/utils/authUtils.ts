import { logger } from '../logger';
import { ServerRole } from '../services/DynamoDBInterfaces';
import type { ServerRoleUsersCache } from './ServerRoleUsersCache';

interface IAuthResponse {
    success: boolean;
    message: string;
}

/**
 * The roles that pass a check for each role: admin passes every check, and developers and moderators also pass a
 * contributor check. A role must be listed here to be checked at all; a check for any other value is refused.
 */
const RolesPassingCheck: Record<ServerRole, readonly ServerRole[]> = {
    [ServerRole.Admin]: [ServerRole.Admin],
    [ServerRole.Developer]: [ServerRole.Admin, ServerRole.Developer],
    [ServerRole.Moderator]: [ServerRole.Admin, ServerRole.Moderator],
    [ServerRole.Contributor]: [ServerRole.Admin, ServerRole.Developer, ServerRole.Moderator, ServerRole.Contributor],
};

export const checkServerRoleUserPrivileges = (
    apiPath: string,
    userId: string,
    role: ServerRole,
    cache?: Pick<ServerRoleUsersCache, 'hasRole'>
): IAuthResponse => {
    if (!userId) {
        return {
            success: false,
            message: 'Authentication required'
        };
    }

    if (!cache) {
        return {
            success: false,
            message: 'Server role service unavailable'
        };
    }

    try {
        // a value that is not a known role (only possible through a cast) passes nothing
        const passingRoles = RolesPassingCheck[role] ?? [];
        if (!passingRoles.some((passingRole) => cache.hasRole(userId, passingRole))) {
            return {
                success: false,
                message: `${role.charAt(0).toUpperCase()}${role.slice(1)} privileges required`
            };
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
