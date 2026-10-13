import type { IModActionEntity, IUserProfileDataEntity } from '../../../server/services/DynamoDBInterfaces';
import { ModActionType, ModerationFieldState } from '../../../server/services/DynamoDBInterfaces';
import type { IUsernameBlockMigrationDb } from '../../../scripts/migration/usernameBlockMigration';
import {
    LEGACY_USERNAME_BLOCK_FIELD,
    migrateMustRequestUsernameChangeAsync,
    USERNAME_BLOCK_MIGRATION_NOTE
} from '../../../scripts/migration/usernameBlockMigration';

describe('migrateMustRequestUsernameChangeAsync', function() {
    const options = { apply: true, moderatorId: 'migration-mod-id', moderatorUsername: 'MigrationMod' };

    let profiles: IUserProfileDataEntity[];
    let existingActions: Record<string, IModActionEntity[]>;
    let db: jasmine.SpyObj<IUsernameBlockMigrationDb>;
    let operations: string[];

    const profile = (id: string, extra: Partial<IUserProfileDataEntity> = {}): IUserProfileDataEntity => {
        const base: IUserProfileDataEntity = {
            id,
            username: `User${id}`,
            lastLogin: '2026-01-01T00:00:00.000Z',
            createdAt: '2026-01-01T00:00:00.000Z',
            showWelcomeMessage: false,
        };
        return { ...base, ...extra };
    };

    const savedActions = (): IModActionEntity[] => db.saveModActionAsync.calls.allArgs().map(([action]) => action);

    beforeEach(function() {
        profiles = [];
        existingActions = {};
        operations = [];

        db = jasmine.createSpyObj<IUsernameBlockMigrationDb>('db', [
            'getAllUserProfilesAsync',
            'getModActionsAsync',
            'saveModActionAsync',
            'updateUserProfileAsync',
            'removeUserProfileAttributeAsync',
        ]);
        db.getAllUserProfilesAsync.and.callFake(() => Promise.resolve(profiles));
        db.getModActionsAsync.and.callFake(({ userId }) => Promise.resolve(existingActions[userId] ?? []));
        db.saveModActionAsync.and.callFake((action) => {
            operations.push(`save:${action.playerId}`);
            return Promise.resolve();
        });
        db.updateUserProfileAsync.and.callFake((userId) => {
            operations.push(`update:${userId}`);
            return Promise.resolve();
        });
        db.removeUserProfileAttributeAsync.and.callFake((userId) => {
            operations.push(`remove:${userId}`);
            return Promise.resolve();
        });
    });

    it('creates an unseen block for `enabled` and removes the legacy field', async function() {
        profiles = [profile('a', { mustRequestUsernameChange: ModerationFieldState.Enabled })];

        const summary = await migrateMustRequestUsernameChangeAsync(db, options);

        expect(summary).toEqual({ scanned: 1, created: 1, alreadyMigrated: 0, skipped: 0, failures: [] });
        expect(savedActions()).toEqual([jasmine.objectContaining({
            playerId: 'a',
            actionType: ModActionType.UsernameChangesBlocked,
            note: USERNAME_BLOCK_MIGRATION_NOTE,
            moderatorId: 'migration-mod-id',
            moderatorUsername: 'MigrationMod',
        })]);
        expect(savedActions()[0].cancelledAt).toBeUndefined();
        expect(db.updateUserProfileAsync).not.toHaveBeenCalled();
        expect(db.removeUserProfileAttributeAsync).toHaveBeenCalledOnceWith('a', LEGACY_USERNAME_BLOCK_FIELD);
    });

    it('carries the acknowledgement over for `enabledAndSeen`', async function() {
        profiles = [profile('a', { mustRequestUsernameChange: ModerationFieldState.EnabledAndSeen })];

        await migrateMustRequestUsernameChangeAsync(db, options);

        const [action] = savedActions();
        expect(db.updateUserProfileAsync).toHaveBeenCalledOnceWith('a', { usernameChangesBlockedSeenActionId: action.id });
        expect(db.removeUserProfileAttributeAsync).toHaveBeenCalledOnceWith('a', LEGACY_USERNAME_BLOCK_FIELD);
    });

    it('saves the action before touching the profile, so an interruption cannot lose the restriction', async function() {
        profiles = [profile('a', { mustRequestUsernameChange: ModerationFieldState.EnabledAndSeen })];

        await migrateMustRequestUsernameChangeAsync(db, options);

        expect(operations).toEqual(['save:a', 'update:a', 'remove:a']);
    });

    it('skips profiles without the legacy field, including an explicit null', async function() {
        profiles = [profile('a'), profile('b', { mustRequestUsernameChange: null }), profile('c', { mustRequestUsernameChange: ModerationFieldState.Enabled })];

        const summary = await migrateMustRequestUsernameChangeAsync(db, options);

        expect(summary).toEqual({ scanned: 3, created: 1, alreadyMigrated: 0, skipped: 2, failures: [] });
        expect(operations).toEqual(['save:c', 'remove:c']);
    });

    it('leaves the legacy field untouched when saving the action fails, so a re-run can repair it', async function() {
        profiles = [profile('a', { mustRequestUsernameChange: ModerationFieldState.Enabled })];
        db.saveModActionAsync.and.rejectWith(new Error('throttled'));

        const summary = await migrateMustRequestUsernameChangeAsync(db, options);

        expect(summary.created).toBe(0);
        expect(summary.failures).toEqual([{ userId: 'a', stage: 'saveModAction', message: 'throttled' }]);
        expect(db.updateUserProfileAsync).not.toHaveBeenCalled();
        expect(db.removeUserProfileAttributeAsync).not.toHaveBeenCalled();
    });

    it('reports a profile failure by user id and does not count the user as created', async function() {
        profiles = [profile('a', { mustRequestUsernameChange: ModerationFieldState.Enabled })];
        db.removeUserProfileAttributeAsync.and.rejectWith(new Error('profile write failed'));

        const summary = await migrateMustRequestUsernameChangeAsync(db, options);

        expect(summary.created).toBe(0);
        expect(summary.failures).toEqual([{ userId: 'a', stage: 'updateProfile', message: 'profile write failed' }]);
    });

    it('keeps going after one user fails', async function() {
        profiles = [
            profile('a', { mustRequestUsernameChange: ModerationFieldState.Enabled }),
            profile('b', { mustRequestUsernameChange: ModerationFieldState.Enabled }),
        ];
        db.saveModActionAsync.and.callFake((action) => (action.playerId === 'a' ? Promise.reject(new Error('boom')) : Promise.resolve()));

        const summary = await migrateMustRequestUsernameChangeAsync(db, options);

        expect(summary.created).toBe(1);
        expect(summary.failures.map((failure) => failure.userId)).toEqual(['a']);
        expect(db.removeUserProfileAttributeAsync).toHaveBeenCalledOnceWith('b', LEGACY_USERNAME_BLOCK_FIELD);
    });

    describe('idempotency', function() {
        const activeBlock = (playerId: string): IModActionEntity => ({
            id: 'existing-action',
            playerId,
            actionType: ModActionType.UsernameChangesBlocked,
            moderatorId: 'mod',
            moderatorUsername: 'Mod',
            createdAt: new Date().toISOString(),
        });

        it('does not create a second block, but still removes the legacy field', async function() {
            profiles = [profile('a', { mustRequestUsernameChange: ModerationFieldState.Enabled })];
            existingActions = { a: [activeBlock('a')] };

            const summary = await migrateMustRequestUsernameChangeAsync(db, options);

            expect(summary).toEqual({ scanned: 1, created: 0, alreadyMigrated: 1, skipped: 0, failures: [] });
            expect(db.saveModActionAsync).not.toHaveBeenCalled();
            expect(db.removeUserProfileAttributeAsync).toHaveBeenCalledOnceWith('a', LEGACY_USERNAME_BLOCK_FIELD);
        });

        it('links the existing action when finishing a half-migrated seen user', async function() {
            profiles = [profile('a', { mustRequestUsernameChange: ModerationFieldState.EnabledAndSeen })];
            existingActions = { a: [activeBlock('a')] };

            await migrateMustRequestUsernameChangeAsync(db, options);

            expect(db.updateUserProfileAsync).toHaveBeenCalledOnceWith('a', { usernameChangesBlockedSeenActionId: 'existing-action' });
        });

        it('ignores cancelled blocks, since the legacy field still means the player is restricted', async function() {
            profiles = [profile('a', { mustRequestUsernameChange: ModerationFieldState.Enabled })];
            existingActions = { a: [{ ...activeBlock('a'), cancelledAt: new Date().toISOString() }] };

            const summary = await migrateMustRequestUsernameChangeAsync(db, options);

            expect(summary.created).toBe(1);
        });

        it('converges on a second run', async function() {
            profiles = [profile('a', { mustRequestUsernameChange: ModerationFieldState.EnabledAndSeen })];
            db.saveModActionAsync.and.callFake((action) => {
                existingActions[action.playerId] = [action];
                return Promise.resolve();
            });
            db.removeUserProfileAttributeAsync.and.callFake((userId, attribute) => {
                profiles = profiles.map((p) => (p.id === userId ? { ...p, [attribute]: undefined } : p));
                return Promise.resolve();
            });

            await migrateMustRequestUsernameChangeAsync(db, options);
            const second = await migrateMustRequestUsernameChangeAsync(db, options);

            expect(db.saveModActionAsync).toHaveBeenCalledTimes(1);
            expect(second).toEqual({ scanned: 1, created: 0, alreadyMigrated: 0, skipped: 1, failures: [] });
        });
    });

    describe('dry run', function() {
        it('reports what would be created without writing anything', async function() {
            profiles = [
                profile('a', { mustRequestUsernameChange: ModerationFieldState.Enabled }),
                profile('b', { mustRequestUsernameChange: ModerationFieldState.EnabledAndSeen }),
                profile('c'),
            ];
            existingActions = { b: [] };

            const summary = await migrateMustRequestUsernameChangeAsync(db, { ...options, apply: false });

            expect(summary).toEqual({ scanned: 3, created: 2, alreadyMigrated: 0, skipped: 1, failures: [] });
            expect(db.saveModActionAsync).not.toHaveBeenCalled();
            expect(db.updateUserProfileAsync).not.toHaveBeenCalled();
            expect(db.removeUserProfileAttributeAsync).not.toHaveBeenCalled();
        });

        it('does not clean up already-migrated users either', async function() {
            profiles = [profile('a', { mustRequestUsernameChange: ModerationFieldState.Enabled })];
            existingActions = { a: [{
                id: 'existing-action',
                playerId: 'a',
                actionType: ModActionType.UsernameChangesBlocked,
                moderatorId: 'mod',
                moderatorUsername: 'Mod',
                createdAt: new Date().toISOString(),
            }] };

            const summary = await migrateMustRequestUsernameChangeAsync(db, { ...options, apply: false });

            expect(summary.alreadyMigrated).toBe(1);
            expect(db.removeUserProfileAttributeAsync).not.toHaveBeenCalled();
        });
    });
});
