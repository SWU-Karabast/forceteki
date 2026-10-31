import type { RoleHolder } from '../../../../helpers/server/RoleHolders';
import { seedRoleHolders } from '../../../../helpers/server/RoleHolders';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';

/** The player report routes expose chat logs and moderation history; none may answer a caller without the moderator role. */
const reportRoutes: { method: 'get' | 'post'; path: string; body?: Record<string, unknown> }[] = [
    { method: 'post', path: '/api/mod/reports/list', body: { status: 'Open' } },
    { method: 'get', path: '/api/mod/reports/open-count' },
    { method: 'post', path: '/api/mod/reports/get', body: { reportId: 'some-report' } },
    { method: 'post', path: '/api/mod/reports/claim', body: { reportId: 'some-report' } },
    { method: 'post', path: '/api/mod/reports/close', body: { reportId: 'some-report', outcome: 'NoAction' } },
    { method: 'post', path: '/api/mod/reports/reopen', body: { reportId: 'some-report' } },
];

/** Signed in, but without a role that satisfies the moderator check (anonymous callers are covered by RouteAuthManifest) */
const refusedHolders: RoleHolder[] = ['nobody', 'contributor', 'developer'];

describe('Player report authorization', function () {
    const roles = seedRoleHolders();

    serverIntegration(function (contextRef) {
        for (const route of reportRoutes) {
            for (const holder of refusedHolders) {
                it(`refuses ${holder === 'nobody' ? 'a signed-in caller with no role' : `the ${holder}`} on ${route.path}`, async function () {
                    const client = contextRef.harness.createAccountClient(roles.accounts[holder]);

                    const response = await client.requestAsync(route.method, route.path, route.body);

                    expect(response.status).toBe(403);
                    expect(response.body).toEqual({ success: false, message: 'Moderator privileges required' });
                });
            }
        }
    }, { database: roles.seed });
});
