import { GameServer } from '../../../../../server/gamenode/GameServer';
import { RegisteredCosmeticType } from '../../../../../server/utils/cosmetics/CosmeticsInterfaces';
import type { ICosmeticEntity } from '../../../../../server/utils/cosmetics/CosmeticsInterfaces';
import { premierBestOfOne } from '../../../../helpers/server/MatchConfigs';
import type { RoleHolder } from '../../../../helpers/server/RoleHolders';
import { roleHolders, seedRoleHolders } from '../../../../helpers/server/RoleHolders';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';
import type { TestClient } from '../../../../helpers/server/TestClient';

/**
 * What each role satisfies. The checks are not a ladder: an admin satisfies every one, a moderator or a
 * developer satisfies only its own and the contributor one, and neither implies the other.
 */
const satisfies: Record<RoleHolder, { admin: boolean; developer: boolean; moderator: boolean; contributor: boolean }> = {
    nobody: { admin: false, developer: false, moderator: false, contributor: false },
    contributor: { admin: false, developer: false, moderator: false, contributor: true },
    developer: { admin: false, developer: true, moderator: false, contributor: true },
    moderator: { admin: false, developer: false, moderator: true, contributor: true },
    admin: { admin: true, developer: true, moderator: true, contributor: true },
};

/** Cosmetics that exist before a spec starts, for the specs that delete one. */
const cardback: ICosmeticEntity = { id: 'cardback-1', title: 'Test Cardback', type: RegisteredCosmeticType.Cardback, path: 'https://example.test/cardback.webp' };
const background: ICosmeticEntity = { id: 'background-1', title: 'Test Background', type: RegisteredCosmeticType.Background, path: 'https://example.test/background.webp' };

/** Cosmetics for the specs that add one, under ids the database does not already hold. */
const newCardback: ICosmeticEntity = { ...cardback, id: 'cardback-2' };
const newBackground: ICosmeticEntity = { ...background, id: 'background-2' };

const oneMinuteMs = 60 * 1000;

/** How long the server waits between re-reading the role lists, which is production's own setting. */
const roleRefreshIntervalMs = GameServer.ServerCacheRefreshMinutes * oneMinuteMs;

async function isMarkedAsync(client: TestClient, role: 'admin' | 'developer' | 'moderator'): Promise<boolean> {
    const response = await client.requestAsync('get', `/api/user-is-${role}`);

    return response.body.success;
}

/**
 * Who may do what, for the server-wide roles (admin, developer, moderator, contributor) that the game node
 * reads from the database. The role routes themselves are listed in `RouteAuthManifest.ts`; these specs
 * check what the roles mean, how quickly a change in them is noticed, and one thing an admin can do with
 * them that every player feels: turning new games off.
 */
describe('Role authorization', function () {
    const roles = seedRoleHolders();

    describe('on a route that needs the moderator role', function () {
        serverIntegration(function (contextRef) {
            for (const holder of roleHolders) {
                const allowed = satisfies[holder].moderator;

                it(`${allowed ? 'serves' : 'refuses'} ${holder === 'nobody' ? 'a signed-in caller with no role' : `the ${holder}`}`, async function () {
                    const client = contextRef.harness.createAccountClient(roles.accounts[holder]);

                    const response = await client.requestAsync('post', '/api/mod/find-user', { searchQuery: roles.accounts.nobody.username });

                    if (allowed) {
                        expect(response.status).toBe(200);
                        expect(response.body.players.map((player: { id: string }) => player.id)).toEqual([roles.accounts.nobody.id]);
                    } else {
                        expect(response.status).toBe(403);
                        expect(response.body).toEqual({ success: false, message: 'Moderator privileges required' });
                    }
                });
            }
        }, { database: roles.seed });
    });

    describe('on a route that needs the admin role', function () {
        serverIntegration(function (contextRef) {
            for (const holder of roleHolders) {
                const allowed = satisfies[holder].admin;

                it(`${allowed ? 'serves' : 'refuses'} ${holder === 'nobody' ? 'a signed-in caller with no role' : `the ${holder}`}`, async function () {
                    const { harness } = contextRef;
                    const client = harness.createAccountClient(roles.accounts[holder]);

                    // a change that would be felt by every player, so that a wrongly-served request is visible
                    const response = await client.requestAsync('post', '/api/mod/server-settings', { gamesEnabled: false });

                    if (allowed) {
                        expect(response.status).toBe(200);
                        expect(harness.db.serverSettings?.gamesEnabled).toBeFalse();
                    } else {
                        expect(response.status).toBe(403);
                        expect(response.body).toEqual({ success: false, message: 'Admin privileges required' });
                        expect(harness.db.serverSettings?.gamesEnabled ?? true).toBeTrue();
                    }
                });
            }
        }, { database: roles.seed });
    });

    describe('the checks the client asks the server to make about the caller', function () {
        serverIntegration(function (contextRef) {
            for (const holder of roleHolders) {
                it(`say what the ${holder === 'nobody' ? 'caller with no role' : holder} is`, async function () {
                    const client = contextRef.harness.createAccountClient(roles.accounts[holder]);

                    const marked = {
                        admin: await isMarkedAsync(client, 'admin'),
                        developer: await isMarkedAsync(client, 'developer'),
                        moderator: await isMarkedAsync(client, 'moderator'),
                        contributor: (await client.requestAsync('get', '/api/cosmetics')).body.isContributor,
                    };

                    expect(marked).toEqual(satisfies[holder]);
                });
            }

            it('say no to an anonymous caller', async function () {
                const anonymous = contextRef.harness.createClient();

                const marked = {
                    admin: await isMarkedAsync(anonymous, 'admin'),
                    developer: await isMarkedAsync(anonymous, 'developer'),
                    moderator: await isMarkedAsync(anonymous, 'moderator'),
                    contributor: (await anonymous.requestAsync('get', '/api/cosmetics')).body.isContributor,
                };

                expect(marked).toEqual(satisfies.nobody);
            });
        }, { database: roles.seed });
    });

    describe('managing cosmetics, which a moderator may do only for card backs', function () {
        serverIntegration(function (contextRef) {
            it('lets a moderator add a card back', async function () {
                const { harness } = contextRef;

                const response = await harness.createAccountClient(roles.accounts.moderator).requestAsync('post', '/api/cosmetics', { cosmetic: newCardback });

                expect(response.status).toBe(201);
                expect(harness.db.cosmetics.get(newCardback.id)).toEqual(newCardback);
            });

            it('refuses a moderator adding any other kind of cosmetic', async function () {
                const { harness } = contextRef;

                const response = await harness.createAccountClient(roles.accounts.moderator).requestAsync('post', '/api/cosmetics', { cosmetic: newBackground });

                expect(response.status).toBe(403);
                expect(harness.db.cosmetics.has(newBackground.id)).toBeFalse();
            });

            it('lets an admin add any kind of cosmetic', async function () {
                const { harness } = contextRef;

                const response = await harness.createAccountClient(roles.accounts.admin).requestAsync('post', '/api/cosmetics', { cosmetic: newBackground });

                expect(response.status).toBe(201);
                expect(harness.db.cosmetics.get(newBackground.id)).toEqual(newBackground);
            });

            it('lets a moderator delete a card back but not another kind of cosmetic', async function () {
                const { harness } = contextRef;
                const moderator = harness.createAccountClient(roles.accounts.moderator);

                const deletedCardback = await moderator.requestAsync('delete', `/api/cosmetics/${cardback.id}`);
                const deletedBackground = await moderator.requestAsync('delete', `/api/cosmetics/${background.id}`);

                expect(deletedCardback.status).toBe(200);
                expect(deletedBackground.status).toBe(403);
                expect(harness.db.cosmetics.has(cardback.id)).toBeFalse();
                expect(harness.db.cosmetics.has(background.id)).toBeTrue();
            });
        }, {
            database: (db) => {
                roles.seed(db);
                db.cosmetics.set(cardback.id, cardback);
                db.cosmetics.set(background.id, background);
            },
        });
    });

    // The server reads the role lists at startup and then at a fixed interval, so a grant or a revocation made in
    // the database takes effect at the next refresh. That is the designed cache behaviour.
    describe('a change to who holds a role', function () {
        serverIntegration(function (contextRef) {
            it('is not noticed until the role lists are next refreshed', async function () {
                const { harness } = contextRef;
                const client = harness.createAccountClient(roles.accounts.nobody);
                harness.db.seedRoles({ moderators: [roles.accounts.moderator.id, roles.accounts.nobody.id] });

                const before = await isMarkedAsync(client, 'moderator');
                await harness.clock.advanceAsync(roleRefreshIntervalMs - oneMinuteMs);
                const justBefore = await isMarkedAsync(client, 'moderator');
                await harness.clock.advanceAsync(oneMinuteMs);
                const after = await isMarkedAsync(client, 'moderator');

                expect([before, justBefore, after]).toEqual([false, false, true]);
            });

            it('applies to a removed moderator only once the lists are refreshed', async function () {
                const { harness } = contextRef;
                const client = harness.createAccountClient(roles.accounts.moderator);
                harness.db.seedRoles({ moderators: [] });

                const before = await isMarkedAsync(client, 'moderator');
                await harness.clock.advanceAsync(roleRefreshIntervalMs - oneMinuteMs);
                const justBefore = await isMarkedAsync(client, 'moderator');
                await harness.clock.advanceAsync(oneMinuteMs);
                const after = await isMarkedAsync(client, 'moderator');

                expect([before, justBefore, after]).toEqual([true, true, false]);
            });
        }, { database: roles.seed });
    });

    describe('turning games off, which only an admin can do', function () {
        serverIntegration(function (contextRef) {
            const maintenance = { gamesEnabled: false, maintenanceMessage: 'Back at noon' };

            async function turnGamesOffAsync(): Promise<void> {
                const response = await contextRef.harness.createAccountClient(roles.accounts.admin).requestAsync('post', '/api/mod/server-settings', maintenance);
                expect(response.status).toBe(200);
            }

            it('is published for any client to read', async function () {
                const { harness } = contextRef;

                await turnGamesOffAsync();
                const response = await harness.api.get('/api/server-settings');

                expect(response.body).toEqual(jasmine.objectContaining({
                    gamesEnabled: false,
                    maintenanceMessage: 'Back at noon',
                    updatedBy: roles.accounts.admin.username,
                }));
                expect(harness.db.serverSettings).toEqual(jasmine.objectContaining(maintenance));
            });

            it('stops a lobby being created', async function () {
                const { harness } = contextRef;
                await turnGamesOffAsync();

                const response = await harness.createClient().createLobbyAsync({
                    lobbyName: harness.uniqueLobbyName(),
                    deck: harness.decklists.validDecklist(),
                    ...premierBestOfOne,
                });

                expect(response.status).toBe(503);
                expect(response.body).toEqual({ success: false, message: 'Back at noon' });
            });

            it('stops a lobby being joined', async function () {
                const { harness } = contextRef;
                const host = harness.createClient();
                await host.createLobbyAsync({ lobbyName: harness.uniqueLobbyName(), deck: harness.decklists.validDecklist(), ...premierBestOfOne });
                await host.connectAsync();
                await turnGamesOffAsync();

                const response = await harness.createClient().joinLobbyAsync(host.lobbyId);

                expect(response.status).toBe(503);
                expect(response.body).toEqual({ success: false, message: 'Back at noon' });
            });

            it('stops the matchmaking queue being entered', async function () {
                const { harness } = contextRef;
                await turnGamesOffAsync();

                const response = await harness.createClient().enterQueueAsync({ deck: harness.decklists.validDecklist(), ...premierBestOfOne });

                expect(response.status).toBe(503);
                expect(response.body).toEqual({ success: false, message: 'Back at noon' });
            });

            it('can be undone, after which lobbies can be created again', async function () {
                const { harness } = contextRef;
                await turnGamesOffAsync();

                const admin = harness.createAccountClient(roles.accounts.admin);
                await admin.requestAsync('post', '/api/mod/server-settings', { gamesEnabled: true });
                const response = await harness.createClient().createLobbyAsync({
                    lobbyName: harness.uniqueLobbyName(),
                    deck: harness.decklists.validDecklist(),
                    ...premierBestOfOne,
                });

                expect(response.status).toBe(200);
            });
        }, { database: roles.seed });
    });
});
