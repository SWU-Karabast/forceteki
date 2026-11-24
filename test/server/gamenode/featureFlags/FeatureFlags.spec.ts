import { CardPool, GamesToWinMode, SwuGameFormat } from '../../../../server/game/core/Constants';
import { ServerRole } from '../../../../server/services/DynamoDBInterfaces';
import { FeatureFlag } from '../../../../server/utils/featureFlags/FeatureFlags';
import { premierBestOfOne } from '../../../helpers/server/MatchConfigs';
import type { RoleHolder } from '../../../helpers/server/RoleHolders';
import { roleHolders, seedRoleHolders } from '../../../helpers/server/RoleHolders';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';
import type { TestClient } from '../../../helpers/server/TestClient';

const fauxSunsBestOfOne = {
    format: SwuGameFormat.FauxSuns,
    cardPool: CardPool.Unlimited,
    gamesToWinMode: GamesToWinMode.BestOfOne,
};

const notAvailable = { success: false, message: 'Faux Suns is not available yet' };

async function createFauxSunsLobbyAsync(harness: ServerTestHarness, client: TestClient) {
    return await client.createLobbyAsync({
        lobbyName: harness.uniqueLobbyName(),
        deck: harness.decklists.validDecklist(fauxSunsBestOfOne),
        ...fauxSunsBestOfOne,
    });
}

async function clientFlagsAsync(client: TestClient): Promise<Record<string, boolean>> {
    const response = await client.requestAsync('post', '/api/get-user');
    expect(response.status).toBe(200);
    return response.body.user.featureFlags;
}

/**
 * Feature flags: who an admin turns each one on for, and what that changes. `fauxSunsAccess` is the
 * flag these use, since it is the first one and decides who may create a Faux Suns lobby.
 */
describe('Feature flags', function () {
    const roles = seedRoleHolders();

    async function setFlagAsync(harness: ServerTestHarness, body: Record<string, unknown>) {
        const admin = harness.createAccountClient(roles.accounts.admin);
        const response = await admin.requestAsync('post', `/api/mod/feature-flags/${FeatureFlag.FauxSunsAccess}`, body);
        expect(response.status).toBe(200);
    }

    describe('that no admin has set yet', function () {
        serverIntegration(function (contextRef) {
            it('are off, so nobody may create a Faux Suns lobby', async function () {
                const { harness } = contextRef;

                const signedIn = await createFauxSunsLobbyAsync(harness, harness.createAccountClient(roles.accounts.nobody));
                const anonymous = await createFauxSunsLobbyAsync(harness, harness.createClient());

                expect(signedIn.status).toBe(403);
                expect(signedIn.body).toEqual(notAvailable);
                expect(anonymous.status).toBe(403);
                expect(anonymous.body).toEqual(notAvailable);
            });

            it('leave other formats alone', async function () {
                const { harness } = contextRef;

                const response = await harness.createClient().createLobbyAsync({
                    lobbyName: harness.uniqueLobbyName(),
                    deck: harness.decklists.validDecklist(),
                    ...premierBestOfOne,
                });

                expect(response.status).toBe(200);
            });

            it('are reported to the client as off', async function () {
                const { harness } = contextRef;

                expect(await clientFlagsAsync(harness.createAccountClient(roles.accounts.nobody))).toEqual({ fauxSunsAccess: false });
                expect(await clientFlagsAsync(harness.createClient())).toEqual({ fauxSunsAccess: false });
            });
        }, { database: roles.seed });
    });

    describe('turned on for a role', function () {
        // the developer check, which an admin also passes
        const allowed: Record<RoleHolder, boolean> = { nobody: false, contributor: false, developer: true, moderator: false, admin: true };

        serverIntegration(function (contextRef) {
            for (const holder of roleHolders) {
                it(`${allowed[holder] ? 'let' : 'do not let'} ${holder === 'nobody' ? 'a signed-in caller with no role' : `the ${holder}`} create a Faux Suns lobby`, async function () {
                    const { harness } = contextRef;
                    await setFlagAsync(harness, { roles: [ServerRole.Developer] });
                    const client = harness.createAccountClient(roles.accounts[holder]);

                    const response = await createFauxSunsLobbyAsync(harness, client);

                    expect(response.status).toBe(allowed[holder] ? 200 : 403);
                    expect(await clientFlagsAsync(client)).toEqual({ fauxSunsAccess: allowed[holder] });
                });
            }
        }, { database: roles.seed });
    });

    describe('turned on for named users', function () {
        serverIntegration(function (contextRef) {
            it('let those users in and nobody else', async function () {
                const { harness } = contextRef;
                await setFlagAsync(harness, { userIds: [roles.accounts.nobody.id] });

                const named = await createFauxSunsLobbyAsync(harness, harness.createAccountClient(roles.accounts.nobody));
                const other = await createFauxSunsLobbyAsync(harness, harness.createAccountClient(roles.accounts.contributor));

                expect(named.status).toBe(200);
                expect(other.status).toBe(403);
            });

            it('never match an anonymous caller, whose id the browser makes up', async function () {
                const { harness } = contextRef;
                const anonymous = harness.createClient();
                await setFlagAsync(harness, { userIds: [anonymous.id] });

                const response = await createFauxSunsLobbyAsync(harness, anonymous);

                expect(response.status).toBe(403);
            });
        }, { database: roles.seed });
    });

    describe('that are enabled', function () {
        serverIntegration(function (contextRef) {
            it('are on for everyone, anonymous callers included', async function () {
                const { harness } = contextRef;
                await setFlagAsync(harness, { enabled: true });

                const response = await createFauxSunsLobbyAsync(harness, harness.createClient());

                expect(response.status).toBe(200);
            });

            it('are on only for their audience again once disabled', async function () {
                const { harness } = contextRef;
                await setFlagAsync(harness, { enabled: true, userIds: [roles.accounts.nobody.id] });
                await setFlagAsync(harness, { enabled: false });

                const named = await createFauxSunsLobbyAsync(harness, harness.createAccountClient(roles.accounts.nobody));
                const other = await createFauxSunsLobbyAsync(harness, harness.createAccountClient(roles.accounts.contributor));

                expect(named.status).toBe(200);
                expect(other.status).toBe(403);
            });
        }, { database: roles.seed });
    });

    describe('stored before the server starts', function () {
        serverIntegration(function (contextRef) {
            it('are read at startup', async function () {
                const { harness } = contextRef;

                const response = await createFauxSunsLobbyAsync(harness, harness.createAccountClient(roles.accounts.nobody));

                expect(response.status).toBe(200);
            });

            it('are listed only if the code still defines them', async function () {
                const response = await contextRef.harness.createAccountClient(roles.accounts.admin).requestAsync('get', '/api/mod/feature-flags');

                expect(response.status).toBe(200);
                expect(response.body.flags.map((flag: { flag: string }) => flag.flag)).toEqual([FeatureFlag.FauxSunsAccess]);
            });
        }, {
            database: (db) => {
                roles.seed(db);
                db.seedFeatureFlag({ flag: FeatureFlag.FauxSunsAccess, userIds: [roles.accounts.nobody.id] });
                db.seedFeatureFlag({ flag: 'retiredFlag', enabled: true });
            }
        });
    });

    describe('in the admin panel', function () {
        serverIntegration(function (contextRef) {
            it('are listed with their definition and their default state', async function () {
                const response = await contextRef.harness.createAccountClient(roles.accounts.admin).requestAsync('get', '/api/mod/feature-flags');

                expect(response.status).toBe(200);
                expect(response.body.flags).toEqual([{
                    flag: FeatureFlag.FauxSunsAccess,
                    description: 'Can create Faux Suns lobbies',
                    defaultEnabled: false,
                    exposeToClient: true,
                    enabled: false,
                    roles: [],
                    userIds: [],
                }]);
            });

            it('record who changed a flag and keep the fields a change leaves out', async function () {
                const { harness } = contextRef;
                const admin = harness.createAccountClient(roles.accounts.admin);
                await admin.requestAsync('post', `/api/mod/feature-flags/${FeatureFlag.FauxSunsAccess}`, { roles: [ServerRole.Developer] });

                const response = await admin.requestAsync('post', `/api/mod/feature-flags/${FeatureFlag.FauxSunsAccess}`, { enabled: true });

                expect(response.status).toBe(200);
                expect(response.body.flag).toEqual(jasmine.objectContaining({
                    enabled: true,
                    roles: [ServerRole.Developer],
                    updatedBy: roles.accounts.admin.username,
                }));
                expect(harness.db.featureFlags.get(FeatureFlag.FauxSunsAccess)).toEqual(jasmine.objectContaining({ enabled: true, roles: [ServerRole.Developer] }));
            });

            it('refuse a flag the code does not define', async function () {
                const response = await contextRef.harness.createAccountClient(roles.accounts.admin).requestAsync('post', '/api/mod/feature-flags/notAFlag', { enabled: true });

                expect(response.status).toBe(404);
                expect(response.body).toEqual({ success: false, message: 'Unknown feature flag \'notAFlag\'' });
            });

            it('refuse a change that sets nothing, or names a role that does not exist', async function () {
                const admin = contextRef.harness.createAccountClient(roles.accounts.admin);
                const path = `/api/mod/feature-flags/${FeatureFlag.FauxSunsAccess}`;

                const empty = await admin.requestAsync('post', path, {});
                const badRole = await admin.requestAsync('post', path, { roles: ['superuser'] });

                expect(empty.status).toBe(400);
                expect(badRole.status).toBe(400);
                expect(contextRef.harness.db.featureFlags.size).toBe(0);
            });

            it('are not open to a moderator', async function () {
                const moderator = contextRef.harness.createAccountClient(roles.accounts.moderator);

                const response = await moderator.requestAsync('post', `/api/mod/feature-flags/${FeatureFlag.FauxSunsAccess}`, { enabled: true });

                expect(response.status).toBe(403);
                expect(response.body).toEqual({ success: false, message: 'Admin privileges required' });
                expect(contextRef.harness.db.featureFlags.size).toBe(0);
            });
        }, { database: roles.seed });
    });

    describe('on a local dev box without a database', function () {
        serverIntegration(function (contextRef) {
            it('are all on, so everything behind a flag can be reached', async function () {
                const { harness } = contextRef;
                const client = harness.createClient();

                const response = await createFauxSunsLobbyAsync(harness, client);

                expect(response.status).toBe(200);
                expect(await clientFlagsAsync(client)).toEqual({ fauxSunsAccess: true });
            });
        }, { database: false });
    });
});
