import type { RoleHolder } from '../../../../helpers/server/RoleHolders';
import { seedRoleHolders } from '../../../../helpers/server/RoleHolders';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';

/** The player report routes expose chat logs and moderation history; none may answer a caller without the moderator role. */
const reportId = '7b2c5a3e-1f4d-4c8a-9e6b-2d3f4a5b6c7d';
const reportRoutes: { method: 'get' | 'put'; path: string; body?: Record<string, unknown> }[] = [
    { method: 'get', path: '/api/mod/reports?status=Open' },
    { method: 'get', path: '/api/mod/reports/open-count' },
    { method: 'get', path: `/api/mod/reports/${reportId}` },
    { method: 'put', path: `/api/mod/reports/${reportId}`, body: { status: 'Closed', outcome: 'NoAction' } },
    { method: 'put', path: `/api/mod/reports/${reportId}`, body: { status: 'Open' } },
];

/** Signed in, but without a role that satisfies the moderator check (anonymous callers are covered by RouteAuthManifest) */
const refusedHolders: RoleHolder[] = ['nobody', 'contributor', 'developer'];

describe('Player report authorization', function () {
    const roles = seedRoleHolders();

    serverIntegration(function (contextRef) {
        for (const route of reportRoutes) {
            for (const holder of refusedHolders) {
                it(`refuses ${holder === 'nobody' ? 'a signed-in caller with no role' : `the ${holder}`} on ${route.method.toUpperCase()} ${route.path} ${JSON.stringify(route.body ?? {})}`, async function () {
                    const client = contextRef.harness.createAccountClient(roles.accounts[holder]);

                    const response = await client.requestAsync(route.method, route.path, route.body);

                    expect(response.status).toBe(403);
                    expect(response.body).toEqual({ success: false, message: 'Moderator privileges required' });
                });
            }
        }
    }, { database: roles.seed });
});
