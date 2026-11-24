import { ServerRole } from '../../../server/services/DynamoDBInterfaces';
import { checkServerRoleUserPrivileges } from '../../../server/utils/authUtils';

/** A role cache in which the user holds exactly the given roles. */
function holding(...roles: ServerRole[]) {
    return { hasRole: (_userId: string, role: ServerRole) => roles.includes(role) };
}

/**
 * Which held roles pass a check for each role. The route-level matrix is in `RoleAuthorization.spec.ts`; this covers
 * the check itself, including a role it does not know.
 */
describe('checkServerRoleUserPrivileges', function () {
    const passes = (required: ServerRole, ...held: ServerRole[]) =>
        checkServerRoleUserPrivileges('/api/test', 'user-1', required, holding(...held)).success;

    it('passes admin for every check, and only admin for an admin check', function () {
        for (const role of Object.values(ServerRole)) {
            expect(passes(role, ServerRole.Admin)).withContext(role)
                .toBeTrue();
        }
        expect(passes(ServerRole.Admin, ServerRole.Developer, ServerRole.Moderator, ServerRole.Contributor)).toBeFalse();
    });

    it('passes developers and moderators for a contributor check, but not for each other\'s', function () {
        expect(passes(ServerRole.Contributor, ServerRole.Developer)).toBeTrue();
        expect(passes(ServerRole.Contributor, ServerRole.Moderator)).toBeTrue();
        expect(passes(ServerRole.Developer, ServerRole.Moderator)).toBeFalse();
        expect(passes(ServerRole.Moderator, ServerRole.Developer)).toBeFalse();
        expect(passes(ServerRole.Developer, ServerRole.Contributor)).toBeFalse();
    });

    it('names the role a refused check needed', function () {
        expect(checkServerRoleUserPrivileges('/api/test', 'user-1', ServerRole.Moderator, holding()).message).toBe('Moderator privileges required');
    });

    it('refuses a check for a role it does not know, even for a user holding every role', function () {
        const everyRole = holding(...Object.values(ServerRole));

        expect(checkServerRoleUserPrivileges('/api/test', 'user-1', 'superuser' as ServerRole, everyRole).success).toBeFalse();
    });
});
