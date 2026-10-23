import { ModActionType, type IModActionEntity } from '../../../../server/services/DynamoDBInterfaces';
import { RegisteredCosmeticType } from '../../../../server/utils/cosmetics/CosmeticsInterfaces';
import { FakeDynamoDbService } from '../../../helpers/server/FakeDynamoDbService';

/**
 * The fake stands in for DynamoDB under every spec that opts in to a database, so its rules are the
 * contract those specs rest on. Each spec here pins a behaviour copied from `DynamoDBService`; if the
 * real service changes one, this is where the fake should be changed to match.
 */
describe('FakeDynamoDbService', function () {
    const fixedNow = new Date('2026-03-01T12:00:00.000Z');
    let db: FakeDynamoDbService;

    beforeEach(function () {
        db = new FakeDynamoDbService(() => fixedNow);
    });

    function modAction(overrides: Partial<IModActionEntity> = {}): IModActionEntity {
        return {
            id: 'action-1',
            playerId: 'player-1',
            actionType: ModActionType.Mute,
            durationDays: 3,
            note: 'because',
            moderatorId: 'mod-1',
            moderatorUsername: 'ModOne',
            createdAt: '2026-02-01T00:00:00.000Z',
            ...overrides,
        };
    }

    describe('identity links', function () {
        it('treats an OAuth link as a conditional put, so a second link for the same identity is refused', async function () {
            await db.saveOAuthLinkAsync('discord', '123', 'user-1');

            await expectAsync(db.saveOAuthLinkAsync('discord', '123', 'user-2'))
                .toBeRejectedWith(jasmine.objectContaining({ name: 'ConditionalCheckFailedException' }));
            expect(await db.getUserIdByOAuthAsync('discord', '123')).toBe('user-1');
        });

        it('keeps OAuth identities from different providers apart', async function () {
            await db.saveOAuthLinkAsync('discord', '123', 'user-1');
            await db.saveOAuthLinkAsync('google', '123', 'user-2');

            expect(await db.getUserIdByOAuthAsync('discord', '123')).toBe('user-1');
            expect(await db.getUserIdByOAuthAsync('google', '123')).toBe('user-2');
        });

        it('finds a user by email regardless of the case it was saved or looked up in', async function () {
            await db.saveEmailLinkAsync('Mixed.Case@Example.com', 'user-1');

            expect(await db.getUserIdByEmailAsync('mixed.case@example.com')).toBe('user-1');
            expect(await db.getUserIdByEmailAsync('MIXED.CASE@EXAMPLE.COM')).toBe('user-1');
            expect(await db.getUserIdByEmailAsync('someone.else@example.com')).toBeUndefined();
        });

        it('finds every user sharing a username regardless of case, and deletes only the named link', async function () {
            await db.saveUsernameLinkAsync('SharedName', 'user-1');
            await db.saveUsernameLinkAsync('sharedname', 'user-2');

            expect((await db.getUserIdsByUsernameAsync('SHAREDNAME')).sort()).toEqual(['user-1', 'user-2']);

            await db.deleteUsernameLinkAsync('SharedName', 'user-1');

            expect(await db.getUserIdsByUsernameAsync('sharedname')).toEqual(['user-2']);
        });
    });

    describe('user profiles', function () {
        it('returns undefined for an unknown user and a copy for a known one', async function () {
            expect(await db.getUserProfileAsync('nobody')).toBeUndefined();

            db.addProfile({ id: 'user-1', username: 'One' });
            const profile = await db.getUserProfileAsync('user-1');
            profile.username = 'Changed';

            expect((await db.getUserProfileAsync('user-1')).username).toBe('One');
        });

        it('defaults the preferences of a saved profile', async function () {
            await db.saveUserProfileAsync({
                id: 'user-1',
                username: 'One',
                lastLogin: '2026-01-01T00:00:00.000Z',
                createdAt: '2026-01-01T00:00:00.000Z',
                showWelcomeMessage: true,
            });

            expect((await db.getUserProfileAsync('user-1')).preferences).toBeDefined();
        });

        it('upserts on update without ever changing the primary key', async function () {
            await db.updateUserProfileAsync('user-1', { id: 'someone-else', username: 'Upserted' });

            const profile = await db.getUserProfileAsync('user-1');
            expect(profile.username).toBe('Upserted');
            expect(profile.id).toBeUndefined();
            expect(await db.getUserProfileAsync('someone-else')).toBeUndefined();
        });

        it('records a login on the injected clock', async function () {
            db.addProfile({ id: 'user-1', username: 'One' });

            await db.recordNewLoginAsync('user-1');

            expect((await db.getUserProfileAsync('user-1')).lastLogin).toBe(fixedNow.toISOString());
            expect(db.loggedInUserIds).toEqual(['user-1']);
        });

        it('merges a preferences update into the stored preferences over the defaults', async function () {
            db.addProfile({ id: 'user-1', username: 'One', preferences: { gameOptions: { muteChat: true } } });

            await db.updateUserPreferencesAsync('user-1', { gameOptions: { cardLanguage: undefined, autoResolve: { singleTarget: true } } });

            const { gameOptions } = (await db.getUserProfileAsync('user-1')).preferences;
            expect(gameOptions.muteChat).toBeTrue();
            expect(gameOptions.autoResolve.singleTarget).toBeTrue();
        });
    });

    describe('seeded accounts', function () {
        it('creates an account that a sign-in resolves to by OAuth link and by email', async function () {
            const account = db.seedAccount({ username: 'Seeded', email: 'Seeded@Example.com' });

            expect(await db.getUserIdByOAuthAsync(account.provider, account.providerId)).toBe(account.id);
            expect(await db.getUserIdByEmailAsync('seeded@example.com')).toBe(account.id);
            expect((await db.getUserProfileAsync(account.id)).username).toBe('Seeded');
            expect(await db.getUserIdsByUsernameAsync('seeded')).toEqual([account.id]);
        });

        it('generates a distinct identity for each account when none is given', function () {
            const first = db.seedAccount();
            const second = db.seedAccount();

            expect(second.id).not.toBe(first.id);
            expect(second.username).not.toBe(first.username);
            expect(second.providerId).not.toBe(first.providerId);
            expect(second.email).not.toBe(first.email);
        });
    });

    describe('mod actions', function () {
        it('keeps only tracked, uncancelled actions in the active index', async function () {
            await db.saveModActionAsync(modAction({ id: 'tracked' }));
            await db.saveModActionAsync(modAction({ id: 'untracked', actionType: ModActionType.Warning, durationDays: undefined }));
            await db.saveModActionAsync(modAction({ id: 'already-cancelled', cancelledAt: '2026-02-02T00:00:00.000Z' }));

            expect((await db.getModActionsAsync()).map((action) => action.id)).toEqual(['tracked']);
            expect((await db.getModActionsAsync({ userId: 'player-1' })).map((action) => action.id).sort())
                .toEqual(['already-cancelled', 'tracked', 'untracked']);
        });

        it('cancels conditionally: once, and only an action that exists', async function () {
            await db.saveModActionAsync(modAction());

            const cancelled = await db.cancelModActionAsync('player-1', 'action-1', 'mod-2', 'ModTwo');

            expect(cancelled.Attributes).toEqual(jasmine.objectContaining({ cancelledAt: fixedNow.toISOString(), cancelledById: 'mod-2' }));
            expect(await db.getModActionsAsync()).toEqual([]);
            await expectAsync(db.cancelModActionAsync('player-1', 'action-1', 'mod-2', 'ModTwo'))
                .toBeRejectedWith(jasmine.objectContaining({ name: 'ConditionalCheckFailedException' }));
            await expectAsync(db.cancelModActionAsync('player-1', 'unknown', 'mod-2', 'ModTwo'))
                .toBeRejectedWith(jasmine.objectContaining({ name: 'ConditionalCheckFailedException' }));
        });

        it('ends an expired action once, without cancelling it, and lists it in its ended bucket', async function () {
            await db.saveModActionAsync(modAction());

            expect(await db.endModActionAsync('player-1', 'action-1', '2026-03-04T00:00:00.000Z')).toBeTrue();
            expect(await db.endModActionAsync('player-1', 'action-1', '2026-05-01T00:00:00.000Z')).toBeFalse();

            expect(await db.getModActionsAsync()).toEqual([]);
            const [stored] = await db.getModActionsAsync({ userId: 'player-1' });
            expect(stored.cancelledAt).toBeUndefined();
            expect(stored.endedAt).toBe('2026-03-04T00:00:00.000Z');
            expect(await db.queryAttributesByGsiAsync('ENDED_MODACTION#2026-03', ['id', 'playerId'])).toEqual([{ id: 'action-1', playerId: 'player-1' }]);

            await db.deleteModActionAsync('player-1', 'action-1');
            expect(await db.getModActionsAsync({ userId: 'player-1' })).toEqual([]);
        });

        it('refuses to end an action that is still active when asked to only end inactive ones', async function () {
            await db.saveModActionAsync(modAction());

            expect(await db.endModActionAsync('player-1', 'action-1', '2026-03-04T00:00:00.000Z', { onlyIfInactive: true })).toBeFalse();
            expect((await db.getModActionsAsync()).length).toBe(1);
        });

        it('activates a pending mute by setting when it started and expires', async function () {
            await db.saveModActionAsync(modAction());

            await db.activateMuteAsync('player-1', 'action-1', '2026-03-01T00:00:00.000Z', '2026-03-04T00:00:00.000Z');

            expect((await db.getModActionsAsync())[0]).toEqual(jasmine.objectContaining({
                startedAt: '2026-03-01T00:00:00.000Z',
                expiresAt: '2026-03-04T00:00:00.000Z',
            }));
        });
    });

    describe('server roles and settings', function () {
        it('reads missing role lists as four empty lists, and returns copies of seeded ones', async function () {
            expect(await db.getServerRoleUsersAsync()).toEqual({ admins: [], developers: [], moderators: [], contributors: [] });

            db.seedRoles({ moderators: ['mod-1'] });
            const roles = await db.getServerRoleUsersAsync();
            roles.moderators.push({ id: 'added-by-caller' });

            expect((await db.getServerRoleUsersAsync()).moderators).toEqual([{ id: 'mod-1' }]);
        });

        it('replaces only the role lists a seed names', function () {
            db.seedRoles({ admins: ['admin-1'], moderators: ['mod-1'] });
            db.seedRoles({ moderators: ['mod-2'] });

            expect(db.roleUsers.admins).toEqual([{ id: 'admin-1' }]);
            expect(db.roleUsers.moderators).toEqual([{ id: 'mod-2' }]);
        });

        it('reads missing settings as games enabled', async function () {
            expect(await db.getServerSettingsAsync()).toEqual({ gamesEnabled: true });
        });

        it('stores settings without the fields that are undefined, and reads gamesEnabled as true unless it is false', async function () {
            await db.saveServerSettingsAsync({ gamesEnabled: false, maintenanceMessage: undefined, updatedBy: 'ModOne' });

            expect(db.serverSettings).toEqual({ gamesEnabled: false, updatedBy: 'ModOne' });
            expect((await db.getServerSettingsAsync()).gamesEnabled).toBeFalse();
        });
    });

    describe('cosmetics', function () {
        it('round-trips cosmetics and clears them', async function () {
            const cosmetic = { id: 'c-1', title: 'Gold', type: RegisteredCosmeticType.Background, path: 'gold.webp' };
            await db.saveCosmeticAsync(cosmetic);

            expect(await db.getCosmeticsAsync()).toEqual([cosmetic]);

            await db.deleteCosmeticAsync('c-1');
            await db.initializeCosmeticsAsync([cosmetic, { ...cosmetic, id: 'c-2' }]);
            expect(await db.clearAllCosmeticsAsync()).toEqual({ deletedCount: 2 });
            expect(await db.getCosmeticsAsync()).toEqual([]);
        });
    });

    describe('as the real service', function () {
        it('fails with a named error when a method outside the faked slice is called', function () {
            const service = db.asService();

            expect(() => service.getDeckAsync('user-1', 'deck-1')).toThrowError(/getDeckAsync is not implemented/);
        });

        it('can be resolved from a promise like a real object', async function () {
            const service = await Promise.resolve(db.asService());

            expect(await service.getUserProfileAsync('nobody')).toBeUndefined();
        });

        it('shares its state with the fake it wraps', async function () {
            const service = db.asService();

            await service.saveUsernameLinkAsync('Wrapped', 'user-1');

            expect([...db.usernameLinks]).toEqual(['wrapped#user-1']);
        });
    });
});
