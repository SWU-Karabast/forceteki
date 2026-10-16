import type { RoleHolder } from '../../../../helpers/server/RoleHolders';
import { seedRoleHolders } from '../../../../helpers/server/RoleHolders';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';
import type { IRouteAuthRow } from './RouteAuthManifest';
import { concretePath, describeRoute, routeAuthManifest } from './RouteAuthManifest';

const rowsWithAccess = (...access: IRouteAuthRow['access'][]): IRouteAuthRow[] =>
    routeAuthManifest.filter((row) => access.includes(row.access));

const roleMessage: Partial<Record<IRouteAuthRow['access'], string>> = {
    moderator: 'Moderator privileges required',
    admin: 'Admin privileges required',
};

/** What turning a caller away as unauthenticated looks like; most routes' exact choice is not asserted (see `IUnauthenticatedOutcome`). */
const refusalStatuses = [401, 403];

/**
 * The guard on the HTTP surface: every route the server registers has a row in `RouteAuthManifest.ts`
 * saying who may call it, and the server still answers each kind of caller the way its row says.
 *
 * Adding a route fails the first spec below until the route is classified, which is the point: whoever
 * adds an endpoint has to say who it is for. This spec checks who gets in, not what a route does for them.
 */
describe('Route authentication manifest', function () {
    describe('completeness', function () {
        serverIntegration(function (contextRef) {
            it('records every route the server registers, in a form the recorder can name', function () {
                expect(() => contextRef.harness.routes).not.toThrow();
            });

            it('lists every route the server registers', function () {
                const listed = new Set(routeAuthManifest.map(describeRoute));

                const unlisted = contextRef.harness.routes.map(describeRoute).filter((route) => !listed.has(route));

                expect(unlisted).withContext('registered by the server but missing from routeAuthManifest')
                    .toEqual([]);
            });

            it('lists only routes the server registers', function () {
                const registered = new Set(contextRef.harness.routes.map(describeRoute));

                const stale = routeAuthManifest.map(describeRoute).filter((route) => !registered.has(route));

                expect(stale).withContext('in routeAuthManifest but no longer registered by the server')
                    .toEqual([]);
            });

            it('lists each route once', function () {
                const listed = routeAuthManifest.map(describeRoute);

                expect(listed.filter((route, index) => listed.indexOf(route) !== index)).toEqual([]);
            });
        }, { recordRoutes: true, database: true });
    });

    describe('a caller with no credentials', function () {
        serverIntegration(function (contextRef) {
            for (const row of routeAuthManifest) {
                const outcome = row.unauthenticated;

                it(`${outcome.refused ? 'is refused by' : 'is served by'} ${describeRoute(row)}`, async function () {
                    const response = await contextRef.harness.requestAsync(row.method, concretePath(row));
                    const received = `${response.status} ${JSON.stringify(response.body)}`;

                    if (outcome.refused) {
                        expect(refusalStatuses).withContext(`expected a refusal, got ${received}`)
                            .toContain(response.status);
                        expect(response.body?.success).withContext(received)
                            .not.toBeTrue();
                    } else if (outcome.status === undefined) {
                        expect(refusalStatuses).withContext(`expected to be served, got ${received}`)
                            .not.toContain(response.status);
                    }

                    if (outcome.status !== undefined) {
                        expect(response.status).withContext(outcome.reliedOnBy ?? received)
                            .toBe(outcome.status);
                    }
                    if (outcome.body) {
                        expect(response.body).toEqual(jasmine.objectContaining(outcome.body));
                    }
                });
            }
        }, { database: true });
    });

    describe('a signed-in caller', function () {
        serverIntegration(function (contextRef) {
            for (const row of rowsWithAccess('signed-in')) {
                // The converse of the specs above: whatever else a handler makes of this request, it must
                // not turn the caller away as unauthenticated. Without it, a change that wrongly treated
                // every caller as anonymous would pass the table above.
                it(`is not refused as unauthenticated by ${describeRoute(row)}`, async function () {
                    const client = contextRef.harness.createAccountClient();

                    const response = await client.requestAsync(row.method, concretePath(row, { userId: client.id }));

                    expect(refusalStatuses).withContext(`${response.status} ${JSON.stringify(response.body)}`)
                        .not.toContain(response.status);
                });
            }
        }, { database: true });
    });

    describe('role-gated routes', function () {
        const roles = seedRoleHolders();

        serverIntegration(function (contextRef) {
            for (const row of rowsWithAccess('moderator', 'admin')) {
                const required = row.access as RoleHolder;
                const refusal = roleMessage[row.access];

                it(`refuse a signed-in caller who holds no role: ${describeRoute(row)}`, async function () {
                    const client = contextRef.harness.createAccountClient(roles.accounts.nobody);

                    const response = await client.requestAsync(row.method, concretePath(row));

                    expect(response.status).toBe(403);
                    expect(response.body).toEqual(jasmine.objectContaining({ success: false, message: refusal }));
                });

                it(`let in a caller who holds exactly the ${required} role: ${describeRoute(row)}`, async function () {
                    const client = contextRef.harness.createAccountClient(roles.accounts[required]);

                    const response = await client.requestAsync(row.method, concretePath(row));

                    // what the handler then makes of an empty body is not this spec's business, only that the
                    // caller got past authentication (a 401 would also satisfy the checks below) and the role check
                    expect(response.status).not.toBe(401);
                    expect(response.body?.message).not.toBe(refusal);
                    expect(response.body?.message).not.toBe('Authentication required');
                });
            }
        }, { database: roles.seed });
    });

    describe('a production-like server', function () {
        serverIntegration(function (contextRef) {
            it('registers every route except the development-only ones', function () {
                const expected = routeAuthManifest.filter((row) => !row.devOnly).map(describeRoute);
                const served = contextRef.harness.routes.map(describeRoute);

                expect(served.filter((route) => !expected.includes(route))).withContext('served, but not expected in production')
                    .toEqual([]);
                expect(expected.filter((route) => !served.includes(route))).withContext('expected in production, but not served')
                    .toEqual([]);
            });

            for (const row of routeAuthManifest.filter((entry) => entry.devOnly)) {
                it(`does not serve ${describeRoute(row)}`, async function () {
                    const response = await contextRef.harness.requestAsync(row.method, concretePath(row));

                    expect(response.status).toBe(404);
                });
            }
        }, { database: true, recordRoutes: true, env: { ENVIRONMENT: 'production' } });
    });
});
