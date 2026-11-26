import type FormData from 'form-data';
import { v4 as uuid } from 'uuid';
import * as Util from '../../../../../server/Util';
import { seedRoleHolders } from '../../../../helpers/server/RoleHolders';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';
import type { TestClient } from '../../../../helpers/server/TestClient';

const roleAssignmentWebhookUrl = 'https://discord.invalid/role-assignment-webhook';

interface IPostedRoleChange {
    url: string;
    content: string;
    fields: Record<string, string>;
    allowedMentions: { parse: string[] };
}

/** Records what the server posts to Discord instead of sending it; with `discordDown`, every post fails. */
function capturePostedRoleChanges({ discordDown = false } = {}): IPostedRoleChange[] {
    const posted: IPostedRoleChange[] = [];
    spyOn(Util, 'httpPostFormData').and.callFake((url: string, formData: FormData) => {
        const body = formData.getBuffer().toString('utf8');
        const payload = JSON.parse((/name="payload_json"\r\n\r\n(.*)\r\n/).exec(body)[1]);
        posted.push({
            url,
            content: payload.content,
            fields: Object.fromEntries(payload.embeds[0].fields.map((field: { name: string; value: string }) => [field.name, field.value])),
            allowedMentions: payload.allowed_mentions,
        });
        return discordDown ? Promise.reject(new Error('webhook unavailable')) : Promise.resolve('');
    });
    return posted;
}

async function isDeveloperAsync(client: TestClient): Promise<boolean> {
    const response = await client.requestAsync('get', '/api/user-is-developer');

    return response.body.success;
}

/**
 * Admins granting and removing the server roles other than admin from the mod page, instead of editing the stored
 * lists by hand. The admin role is still changed only by hand.
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

            // the stored lists record who changed them by id, and when
            expect(harness.db.roleUsers.updatedById).toBe(roles.accounts.admin.id);
            expect(harness.db.roleUsers.updatedAt).toBe(harness.clock.currentDate().toISOString());
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
            expect(harness.db.roleUsers.updatedById).toBeUndefined();
        });

        it('keeps a change made by hand since the server last read the roles', async function () {
            const { harness } = contextRef;
            const admin = harness.createAccountClient(roles.accounts.admin);
            const latecomer = harness.db.seedAccount({ username: 'latecomer' });
            harness.db.seedRoles({ moderator: [roles.accounts.moderator.id, latecomer.id] });

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.nobody.id, role: 'moderator', granted: true });

            expect(response.status).toBe(200);
            expect(response.body.roles.moderator.map((holder: { id: string }) => holder.id))
                .toEqual([roles.accounts.moderator.id, latecomer.id, roles.accounts.nobody.id]);
        });

        it('keeps a change made by hand to another role between the server reading the roles and writing them', async function () {
            const { harness } = contextRef;
            const admin = harness.createAccountClient(roles.accounts.admin);
            const latecomer = harness.db.seedAccount({ username: 'latecomer' });

            const readStoredLists = harness.db.getServerRoleUsersAsync.bind(harness.db);
            spyOn(harness.db, 'getServerRoleUsersAsync').and.callFake(async (options) => {
                const lists = await readStoredLists(options);
                harness.db.seedRoles({ moderator: [roles.accounts.moderator.id, latecomer.id] });
                return lists;
            });

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.nobody.id, role: 'developer', granted: true });

            expect(response.status).toBe(200);
            expect(harness.db.roleUsers.moderator.map((holder) => holder.id)).toEqual([roles.accounts.moderator.id, latecomer.id]);
        });

        it('refuses granting the admin role, which is changed only by hand', async function () {
            const { harness } = contextRef;
            const admin = harness.createAccountClient(roles.accounts.admin);

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.nobody.id, role: 'admin', granted: true });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ success: false, message: 'The admin role cannot be changed here' });
            expect(harness.db.roleUsers.admin).toEqual([{ id: roles.accounts.admin.id }]);
        });

        it('refuses removing the admin role, which is changed only by hand', async function () {
            const { harness } = contextRef;
            const admin = harness.createAccountClient(roles.accounts.admin);
            const otherAdmin = harness.db.seedAccount({ username: 'otherAdmin' });
            harness.db.seedRoles({ admin: [roles.accounts.admin.id, otherAdmin.id] });

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: otherAdmin.id, role: 'admin', granted: false });

            expect(response.status).toBe(403);
            expect(harness.db.roleUsers.admin).toEqual([{ id: roles.accounts.admin.id }, { id: otherAdmin.id }]);
        });

        it('refuses an admin whose admin role was removed by hand since the server last read the roles', async function () {
            const { harness } = contextRef;
            const formerAdmin = harness.createAccountClient(roles.accounts.admin);
            harness.db.seedRoles({ admin: [roles.accounts.developer.id] });

            const response = await formerAdmin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.nobody.id, role: 'moderator', granted: true });

            expect(response.status).toBe(403);
            expect(harness.db.roleUsers.moderator).toEqual([{ id: roles.accounts.moderator.id }]);

            // and the server now knows, so they lose their admin access at once rather than at the next refresh
            const listResponse = await formerAdmin.requestAsync('get', '/api/mod/server-roles');
            expect(listResponse.status).toBe(403);
        });

        it('refuses granting a role to a user with no account', async function () {
            const { harness } = contextRef;
            const admin = harness.createAccountClient(roles.accounts.admin);

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: uuid(), role: 'developer', granted: true });

            expect(response.status).toBe(404);
            expect(harness.db.roleUsers.developer).toEqual([{ id: roles.accounts.developer.id }]);
        });

        it('removes a role from a user with no account, such as one deleted since it was granted', async function () {
            const { harness } = contextRef;
            const admin = harness.createAccountClient(roles.accounts.admin);
            const deletedUserId = uuid();
            harness.db.seedRoles({ developer: [roles.accounts.developer.id, deletedUserId] });

            const listed = await admin.requestAsync('get', '/api/mod/server-roles');
            expect(listed.body.roles.developer).toContain({ id: deletedUserId, username: null, note: null });

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: deletedUserId, role: 'developer', granted: false });

            expect(response.status).toBe(200);
            expect(harness.db.roleUsers.developer).toEqual([{ id: roles.accounts.developer.id }]);
        });

        it('refuses a user id that is not a uuid', async function () {
            const { harness } = contextRef;
            const admin = harness.createAccountClient(roles.accounts.admin);

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: 'not-a-user-id', role: 'developer', granted: false });

            expect(response.status).toBe(400);
        });

        it('refuses a change when the roles were changed by someone else at the same time', async function () {
            const { harness } = contextRef;
            const admin = harness.createAccountClient(roles.accounts.admin);

            // another admin's change lands between this change reading the lists and writing them
            const readStoredLists = harness.db.getServerRoleUsersAsync.bind(harness.db);
            spyOn(harness.db, 'getServerRoleUsersAsync').and.callFake(async (options) => {
                const lists = await readStoredLists(options);
                harness.db.roleUsers.updatedAt = '2026-01-01T00:00:00.000Z';
                return lists;
            });

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.nobody.id, role: 'developer', granted: true });

            expect(response.status).toBe(409);
            expect(harness.db.roleUsers.developer).toEqual([{ id: roles.accounts.developer.id }]);
        });

        it('reloads the roles after a change with a consistent read, so the cache cannot pick up the lists from before it', async function () {
            const { harness } = contextRef;
            const admin = harness.createAccountClient(roles.accounts.admin);
            const reads = spyOn(harness.db, 'getServerRoleUsersAsync').and.callThrough();

            await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.nobody.id, role: 'developer', granted: true });

            // the fake is always consistent, so this checks what the server asks for rather than what it gets
            expect(reads.calls.count()).toBe(2);
            expect(reads.calls.allArgs()).toEqual([[{ consistentRead: true }], [{ consistentRead: true }]]);
        });

        it('refuses a role that does not exist', async function () {
            const admin = contextRef.harness.createAccountClient(roles.accounts.admin);

            const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.nobody.id, role: 'superuser', granted: true });

            expect(response.status).toBe(400);
        });
    }, { database: roles.seed });

    describe('posting each change to the role assignment channel on Discord', function () {
        serverIntegration(function (contextRef) {
            it('posts a granted role with the user, the role and the admin who granted it', async function () {
                const admin = contextRef.harness.createAccountClient(roles.accounts.admin);
                const posted = capturePostedRoleChanges();

                await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.nobody.id, role: 'moderator', granted: true });

                expect(posted.length).toBe(1);
                expect(posted[0].url).toBe(roleAssignmentWebhookUrl);
                expect(posted[0].content).toBe('`adminUser` granted the **moderator** role to `nobodyUser`');
                expect(posted[0].fields).toEqual({
                    User: `\`nobodyUser\` (${roles.accounts.nobody.id})`,
                    Role: 'moderator',
                    'Changed by': `\`adminUser\` (${roles.accounts.admin.id})`,
                });
                // a username can never ping anyone in the channel
                expect(posted[0].allowedMentions).toEqual({ parse: [] });
            });

            it('posts a removed role', async function () {
                const admin = contextRef.harness.createAccountClient(roles.accounts.admin);
                const posted = capturePostedRoleChanges();

                await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.developer.id, role: 'developer', granted: false });

                expect(posted.map((post) => post.content)).toEqual(['`adminUser` removed the **developer** role from `developerUser`']);
            });

            it('posts nothing when nothing changed', async function () {
                const admin = contextRef.harness.createAccountClient(roles.accounts.admin);
                const posted = capturePostedRoleChanges();

                await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.developer.id, role: 'developer', granted: true });
                await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.nobody.id, role: 'admin', granted: true });

                expect(posted).toEqual([]);
            });

            it('still posts a change when reloading the roles after it fails', async function () {
                const { harness } = contextRef;
                const admin = harness.createAccountClient(roles.accounts.admin);
                const posted = capturePostedRoleChanges();

                // the change's own read succeeds, and the reload after the write fails
                const readStoredLists = harness.db.getServerRoleUsersAsync.bind(harness.db);
                let reads = 0;
                spyOn(harness.db, 'getServerRoleUsersAsync').and.callFake((options) =>
                    (++reads === 1 ? readStoredLists(options) : Promise.reject(new Error('database unavailable'))));

                const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.nobody.id, role: 'moderator', granted: true });

                expect(response.status).toBe(200);
                expect(harness.db.roleUsers.moderator.map((holder) => holder.id)).toContain(roles.accounts.nobody.id);
                expect(posted.map((post) => post.content)).toEqual(['`adminUser` granted the **moderator** role to `nobodyUser`']);
            });

            it('still makes the change when Discord is down', async function () {
                const { harness } = contextRef;
                const admin = harness.createAccountClient(roles.accounts.admin);
                capturePostedRoleChanges({ discordDown: true });

                const response = await admin.requestAsync('post', '/api/mod/server-roles', { userId: roles.accounts.nobody.id, role: 'moderator', granted: true });

                expect(response.status).toBe(200);
                expect(harness.db.roleUsers.moderator.map((holder) => holder.id)).toContain(roles.accounts.nobody.id);
            });
        }, { database: roles.seed, env: { DISCORD_ROLE_ASSIGNMENT_WEBHOOK_URL: roleAssignmentWebhookUrl } });
    });
});
