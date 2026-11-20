import { seedRoleHolders } from '../../../../helpers/server/RoleHolders';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';
import type { TestClient } from '../../../../helpers/server/TestClient';

async function isDeveloperAsync(client: TestClient): Promise<boolean> {
    const response = await client.requestAsync('get', '/api/user-is-developer');

    return response.body.success;
}

/**
 * Admins granting and removing the server roles from the mod page, instead of editing the stored lists by hand.
 * Who may call these routes is in `RouteAuthManifest.ts`; these specs check what a change does.
 */
describe('Server role management', function () {
    const roles = seedRoleHolders();

    serverIntegration(function (contextRef) {
        it('lists each role\'s users with their usernames', async function () {
            const admin = contextRef.harness.createAccountClient(roles.accounts.admin);

            const response = await admin.requestAsync('get', '/api/mod/server-roles');

            expect(response.status).toBe(200);
            expect(response.body.roles).toEqual({
                admin: [{ id: roles.accounts.admin.id, username: 'adminUser', note: null }],
                developer: [{ id: roles.accounts.developer.id, username: 'developerUser', note: null }],
                moderator: [{ id: roles.accounts.moderator.id, username: 'moderatorUser', note: null }],
                contributor: [{ id: roles.accounts.contributor.id, username: 'contributorUser', note: null }],
            });
        });

        it('grants a role that applies at once, noting who the user is', async function () {
            const { harness } = contextRef;
            const admin = harness.createAccountClient(roles.accounts.admin);
            const player = harness.createAccountClient(roles.accounts.nobody);
            expect(await isDeveloperAsync(player)).toBeFalse();

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.nobody.id, role: 'developer', granted: true });

            expect(response.status).toBe(200);
            expect(response.body.roles.developer).toContain({ id: roles.accounts.nobody.id, username: 'nobodyUser', note: 'nobodyUser' });
            expect(response.body.updatedBy).toBe('adminUser');
            expect(await isDeveloperAsync(player)).toBeTrue();
        });

        it('removes a role, which applies at once', async function () {
            const { harness } = contextRef;
            const admin = harness.createAccountClient(roles.accounts.admin);
            const developer = harness.createAccountClient(roles.accounts.developer);
            expect(await isDeveloperAsync(developer)).toBeTrue();

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.developer.id, role: 'developer', granted: false });

            expect(response.status).toBe(200);
            expect(response.body.roles.developer).toEqual([]);
            expect(await isDeveloperAsync(developer)).toBeFalse();
        });

        it('changes nothing when the user already has the role', async function () {
            const { harness } = contextRef;
            const admin = harness.createAccountClient(roles.accounts.admin);

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.developer.id, role: 'developer', granted: true });

            expect(response.status).toBe(200);
            expect(response.body.roles.developer).toEqual([{ id: roles.accounts.developer.id, username: 'developerUser', note: null }]);
            expect(harness.db.roleUsers.updatedBy).toBeUndefined();
        });

        it('keeps a change made by hand since the server last read the roles', async function () {
            const { harness } = contextRef;
            const admin = harness.createAccountClient(roles.accounts.admin);
            const latecomer = harness.db.seedAccount({ username: 'latecomer' });
            harness.db.seedRoles({ moderators: [roles.accounts.moderator.id, latecomer.id] });

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.nobody.id, role: 'moderator', granted: true });

            expect(response.status).toBe(200);
            expect(response.body.roles.moderator.map((holder: { id: string }) => holder.id))
                .toEqual([roles.accounts.moderator.id, latecomer.id, roles.accounts.nobody.id]);
        });

        it('refuses an admin removing their own admin role', async function () {
            const { harness } = contextRef;
            const admin = harness.createAccountClient(roles.accounts.admin);

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.admin.id, role: 'admin', granted: false });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ success: false, message: 'You cannot remove your own admin role' });
            expect(harness.db.roleUsers.admins).toEqual([{ id: roles.accounts.admin.id }]);
        });

        it('refuses an admin whose admin role was removed by hand since the server last read the roles', async function () {
            const { harness } = contextRef;
            const formerAdmin = harness.createAccountClient(roles.accounts.admin);
            harness.db.seedRoles({ admins: [roles.accounts.developer.id] });

            const response = await formerAdmin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.nobody.id, role: 'admin', granted: true });

            expect(response.status).toBe(403);
            expect(harness.db.roleUsers.admins).toEqual([{ id: roles.accounts.developer.id }]);

            // and the server now knows, so they lose their admin access at once rather than at the next refresh
            const listResponse = await formerAdmin.requestAsync('get', '/api/mod/server-roles');
            expect(listResponse.status).toBe(403);
        });

        it('refuses a user with no account', async function () {
            const { harness } = contextRef;
            const admin = harness.createAccountClient(roles.accounts.admin);

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: 'no-such-user', role: 'developer', granted: true });

            expect(response.status).toBe(404);
            expect(harness.db.roleUsers.developers).toEqual([{ id: roles.accounts.developer.id }]);
        });

        it('refuses a role that does not exist', async function () {
            const admin = contextRef.harness.createAccountClient(roles.accounts.admin);

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.nobody.id, role: 'superuser', granted: true });

            expect(response.status).toBe(400);
        });
    }, { database: roles.seed });
});
