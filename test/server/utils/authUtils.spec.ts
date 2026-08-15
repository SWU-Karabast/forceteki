import { ServerRole } from '../../../server/services/DynamoDBInterfaces';
import { checkServerRoleUserPrivileges } from '../../../server/utils/authUtils';

describe('checkServerRoleUserPrivileges', () => {
    it('safely denies access when the server role cache is unavailable', () => {
        const result = checkServerRoleUserPrivileges('/api/user-is-moderator', 'exe66', ServerRole.Moderator, undefined);

        expect(result).toEqual({
            success: false,
            message: 'Server role service unavailable'
        });
    });
});
