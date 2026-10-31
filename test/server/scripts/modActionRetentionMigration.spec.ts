import type { IModActionEntity, IUserProfileDataEntity, IUsernameChangeEntity } from '../../../server/services/DynamoDBInterfaces';
import { ModActionType, UsernameChangeSource } from '../../../server/services/DynamoDBInterfaces';
import type { IModActionRetentionMigrationDb } from '../../../scripts/migration/modActionRetentionMigration';
import { deriveEndedAt, migrateModActionRetentionAsync } from '../../../scripts/migration/modActionRetentionMigration';

const NOW = new Date('2026-11-01T12:00:00.000Z');

const action = (overrides: Partial<IModActionEntity>): IModActionEntity => ({
    id: 'action-1',
    playerId: 'player-1',
    actionType: ModActionType.Warning,
    moderatorId: 'mod-1',
    moderatorUsername: 'ModOne',
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
});

const forcedRename = (relatedModActionId: string, createdAt: string): IUsernameChangeEntity => ({
    id: `change-${relatedModActionId}`,
    playerId: 'player-1',
    previousUsername: 'OldName',
    newUsername: 'NewName',
    source: UsernameChangeSource.ForcedRename,
    relatedModActionId,
    createdAt,
});

describe('modActionRetentionMigration', function() {
    describe('deriveEndedAt', function() {
        it('uses the cancellation time of cancelled actions', function() {
            const cancelled = action({ actionType: ModActionType.UsernameChangesBlocked, cancelledAt: '2026-07-02T00:00:00.000Z' });

            expect(deriveEndedAt(cancelled, [], NOW)).toEqual({ endedAt: '2026-07-02T00:00:00.000Z', fromMigrationTime: false });
        });

        it('uses the creation time of one-off actions', function() {
            expect(deriveEndedAt(action({ actionType: ModActionType.Warning }), [], NOW).endedAt).toBe('2026-06-01T00:00:00.000Z');
            expect(deriveEndedAt(action({ actionType: ModActionType.ChangeUsername }), [], NOW).endedAt).toBe('2026-06-01T00:00:00.000Z');
        });

        it('uses the expiry of an expired mute', function() {
            const mute = action({ actionType: ModActionType.Mute, durationDays: 7, startedAt: '2026-06-02T00:00:00.000Z', expiresAt: '2026-06-09T00:00:00.000Z' });

            expect(deriveEndedAt(mute, [], NOW).endedAt).toBe('2026-06-09T00:00:00.000Z');
        });

        it('never uses an expiry in the future, for a mute that was superseded before it ran out', function() {
            const superseded = action({ actionType: ModActionType.Mute, durationDays: 30, startedAt: '2026-10-20T00:00:00.000Z', expiresAt: '2026-11-19T00:00:00.000Z' });

            expect(deriveEndedAt(superseded, [], NOW)).toEqual({ endedAt: NOW.toISOString(), fromMigrationTime: true });
        });

        it('uses the rename that resolved a forced rename', function() {
            const rename = action({ id: 'rename-1', actionType: ModActionType.Rename });
            const changes = [forcedRename('other-action', '2026-06-03T00:00:00.000Z'), forcedRename('rename-1', '2026-06-05T00:00:00.000Z')];

            expect(deriveEndedAt(rename, changes, NOW).endedAt).toBe('2026-06-05T00:00:00.000Z');
        });

        it('falls back to the migration time when the data does not tell when the action ended', function() {
            const rename = action({ actionType: ModActionType.Rename });

            expect(deriveEndedAt(rename, [], NOW)).toEqual({ endedAt: NOW.toISOString(), fromMigrationTime: true });
        });
    });

    describe('migrateModActionRetentionAsync', function() {
        let db: jasmine.SpyObj<IModActionRetentionMigrationDb>;
        let actionsByPlayer: Map<string, IModActionEntity[]>;
        let activeActions: IModActionEntity[];

        beforeEach(function() {
            actionsByPlayer = new Map();
            activeActions = [];
            db = jasmine.createSpyObj<IModActionRetentionMigrationDb>('db', [
                'getAllUserProfilesAsync',
                'getModActionsAsync',
                'getUsernameChangesAsync',
                'endModActionAsync',
            ]);
            db.getAllUserProfilesAsync.and.callFake(() => {
                const profiles = [...actionsByPlayer.keys()].map((id): Partial<IUserProfileDataEntity> => ({ id }));
                return Promise.resolve(profiles as IUserProfileDataEntity[]);
            });
            db.getModActionsAsync.and.callFake((options) => Promise.resolve(
                options.userId ? actionsByPlayer.get(options.userId) ?? [] : activeActions
            ));
            db.getUsernameChangesAsync.and.resolveTo([]);
            db.endModActionAsync.and.resolveTo(true);
        });

        it('ends only actions that are neither active nor already migrated', async function() {
            const active = action({ id: 'active', actionType: ModActionType.ReportingDisabled });
            activeActions = [active];
            actionsByPlayer.set('player-1', [
                active,
                action({ id: 'migrated', endedAt: '2026-06-01T00:00:00.000Z' }),
                action({ id: 'warning' }),
            ]);

            const summary = await migrateModActionRetentionAsync(db, { apply: true, now: NOW });

            expect(db.endModActionAsync).toHaveBeenCalledOnceWith('player-1', 'warning', '2026-06-01T00:00:00.000Z', { onlyIfInactive: true });
            expect(summary).toEqual(jasmine.objectContaining({ scannedProfiles: 1, ended: 1, alreadyMigrated: 1, stillActive: 1, failures: [] }));
        });

        it('leaves an action alone that became active after the snapshot of active actions', async function() {
            actionsByPlayer.set('player-1', [action({ id: 'new-mute', actionType: ModActionType.Mute })]);
            db.endModActionAsync.and.resolveTo(false);

            const summary = await migrateModActionRetentionAsync(db, { apply: true, now: NOW });

            expect(summary.ended).toBe(0);
            expect(summary.stillActive).toBe(1);
        });

        it('writes nothing in a dry run', async function() {
            actionsByPlayer.set('player-1', [action({ id: 'warning' })]);

            const summary = await migrateModActionRetentionAsync(db, { apply: false, now: NOW });

            expect(db.endModActionAsync).not.toHaveBeenCalled();
            expect(summary.ended).toBe(1);
        });

        it('records a player whose actions cannot be read and carries on with the next player', async function() {
            actionsByPlayer.set('broken', []);
            actionsByPlayer.set('player-1', [action({ id: 'warning' })]);
            const readActions = db.getModActionsAsync.and.callFake((options) => {
                if (options.userId === 'broken') {
                    return Promise.reject(new Error('invalid item'));
                }
                return Promise.resolve(options.userId ? actionsByPlayer.get(options.userId) ?? [] : []);
            });

            const summary = await migrateModActionRetentionAsync(db, { apply: true, now: NOW });

            expect(readActions).toHaveBeenCalled();
            expect(summary.ended).toBe(1);
            expect(summary.failures).toEqual([{ userId: 'broken', modActionId: '(all)', message: 'invalid item' }]);
        });

        it('records a player whose username history cannot be read and carries on', async function() {
            actionsByPlayer.set('broken', [action({ id: 'rename', playerId: 'broken', actionType: ModActionType.Rename })]);
            actionsByPlayer.set('player-1', [action({ id: 'warning' })]);
            db.getUsernameChangesAsync.and.callFake((userId) => (userId === 'broken' ? Promise.reject(new Error('throttled')) : Promise.resolve([])));

            const summary = await migrateModActionRetentionAsync(db, { apply: true, now: NOW });

            expect(summary.ended).toBe(1);
            expect(summary.failures).toEqual([{ userId: 'broken', modActionId: '(all)', message: 'throttled' }]);
        });

        it('records failures and carries on with the next action', async function() {
            actionsByPlayer.set('player-1', [action({ id: 'fails' }), action({ id: 'works' })]);
            db.endModActionAsync.and.callFake((_playerId, modActionId) => (modActionId === 'fails' ? Promise.reject(new Error('throttled')) : Promise.resolve(true)));

            const summary = await migrateModActionRetentionAsync(db, { apply: true, now: NOW });

            expect(summary.ended).toBe(1);
            expect(summary.failures).toEqual([{ userId: 'player-1', modActionId: 'fails', message: 'throttled' }]);
        });
    });
});
