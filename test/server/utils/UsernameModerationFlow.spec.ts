import * as DynamoDBServiceModule from '../../../server/services/DynamoDBService';
import type { IUserProfileDataEntity } from '../../../server/services/DynamoDBInterfaces';
import { ModActionType, ModerationFieldState, UsernameChangeSource } from '../../../server/services/DynamoDBInterfaces';
import { ModActionService } from '../../../server/utils/ModActionService';
import type { IModActionSubmission } from '../../../server/utils/ModActionSubmissionHandler';
import { ModActionSubmissionHandler } from '../../../server/utils/ModActionSubmissionHandler';
import { UserFactory } from '../../../server/utils/user/UserFactory';
import { migrateMustRequestUsernameChangeAsync } from '../../../scripts/migration/usernameBlockMigration';
import { FakeDynamoDbService } from '../../helpers/server/FakeDynamoDbService';

describe('Username moderation flow (real services over an in-memory DB)', function() {
    const playerId = 'player-1';
    const moderator = { moderatorId: 'mod-1', moderatorUsername: 'ModOne' };

    let db: FakeDynamoDbService;
    let modActions: ModActionService;
    let userFactory: UserFactory;
    let handler: ModActionSubmissionHandler;

    const submit = (request: Partial<IModActionSubmission> & Pick<IModActionSubmission, 'actionType'>) =>
        handler.submitAsync({ playerId, ...moderator, note: 'because', ...request });

    const profile = (): IUserProfileDataEntity => db.profiles.get(playerId);

    // Mirrors how /api/get-user derives the notice state
    const noticeSeen = (): boolean => profile().usernameChangesBlockedSeenActionId === modActions.getActiveUsernameChangesBlockedActionId(playerId);

    beforeEach(async function() {
        // ModActionService starts a refresh timer; the mock clock keeps it from leaking out of the spec
        jasmine.clock().install();

        db = new FakeDynamoDbService();
        db.addProfile({ id: playerId, username: 'BadName', usernameLastUpdatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() });

        spyOn(DynamoDBServiceModule, 'getDynamoDbServiceAsync').and.resolveTo(db.asService());
        modActions = await ModActionService.createAsync();
        userFactory = new UserFactory();
        handler = new ModActionSubmissionHandler(modActions, userFactory);
    });

    afterEach(function() {
        jasmine.clock().uninstall();
    });

    describe('Block Username Changes with a separate ChangeUsername action', function() {
        it('blocks the player, resets the username, and links username history to the username-change action', async function() {
            const blockResult = await submit({ actionType: ModActionType.UsernameChangesBlocked });
            const changeResult = await submit({ actionType: ModActionType.ChangeUsername, newUsername: 'KaraUser0427' });
            const changeAction = db.actionsOfType(ModActionType.ChangeUsername)[0];

            expect(blockResult.success).toBeTrue();
            expect(changeResult.success).toBeTrue();
            expect(modActions.isUsernameChangesBlocked(playerId)).toBeTrue();
            expect(changeAction.active).toBeFalse();
            expect(changeAction.id).not.toBe(modActions.getActiveUsernameChangesBlockedActionId(playerId));
            expect(profile().username).toBe('KaraUser0427');
            expect([...db.usernameLinks]).toEqual([`karauser0427#${playerId}`]);
            expect(db.usernameChanges).toEqual([jasmine.objectContaining({
                previousUsername: 'BadName',
                newUsername: 'KaraUser0427',
                source: UsernameChangeSource.UsernameChangedByModerator,
                relatedModActionId: changeAction.id,
            })]);
        });

        it('keeps the player from renaming themselves, using the block state the cache reports', async function() {
            await submit({ actionType: ModActionType.UsernameChangesBlocked });
            await submit({ actionType: ModActionType.ChangeUsername, newUsername: 'KaraUser0427' });
            const usernameChangesBlocked = modActions.isUsernameChangesBlocked(playerId);

            const eligibility = await userFactory.canChangeUsernameAsync(playerId, { usernameChangesBlocked });
            const attempt = await userFactory.changeUsernameAsync(playerId, 'MyOwnName', { usernameChangesBlocked });

            expect(eligibility.canChange).toBeFalse();
            expect(attempt.success).toBeFalse();
            expect(profile().username).toBe('KaraUser0427');
        });

        it('does not count the reset against the player\'s own rename cooldown', async function() {
            const before = profile().usernameLastUpdatedAt;

            await submit({ actionType: ModActionType.UsernameChangesBlocked });
            await submit({ actionType: ModActionType.ChangeUsername, newUsername: 'KaraUser0427' });

            expect(profile().usernameLastUpdatedAt).toBe(before);
        });

        it('only blocks when the reset is not requested', async function() {
            await submit({ actionType: ModActionType.UsernameChangesBlocked });

            expect(modActions.isUsernameChangesBlocked(playerId)).toBeTrue();
            expect(profile().username).toBe('BadName');
            expect(db.usernameChanges).toEqual([]);
        });
    });

    describe('Change Username', function() {
        it('applies an approved rename while the block stays in place', async function() {
            await submit({ actionType: ModActionType.UsernameChangesBlocked });
            await submit({ actionType: ModActionType.ChangeUsername, newUsername: 'KaraUser0427' });
            const blockId = modActions.getActiveUsernameChangesBlockedActionId(playerId);

            const result = await submit({ actionType: ModActionType.ChangeUsername, newUsername: 'ApprovedName', note: 'approved in ticket 123' });

            expect(result.success).toBeTrue();
            expect(profile().username).toBe('ApprovedName');
            expect(modActions.getActiveUsernameChangesBlockedActionId(playerId)).toBe(blockId);

            const changeActions = db.actionsOfType(ModActionType.ChangeUsername);
            expect(changeActions.length).toBe(2);
            expect(changeActions[1].active).toBeFalse();
            expect(changeActions[1].cancelledAt).toBeUndefined();
            expect(db.usernameChanges[1]).toEqual(jasmine.objectContaining({
                previousUsername: 'KaraUser0427',
                newUsername: 'ApprovedName',
                source: UsernameChangeSource.UsernameChangedByModerator,
                relatedModActionId: changeActions[1].id,
            }));
        });

        it('renames a player who is not blocked, inside their cooldown, and moves the lookup link', async function() {
            const result = await submit({ actionType: ModActionType.ChangeUsername, newUsername: 'ApprovedName' });

            expect(result.success).toBeTrue();
            expect([...db.usernameLinks]).toEqual([`approvedname#${playerId}`]);
        });

        it('rejects invalid names without recording anything', async function() {
            const result = await submit({ actionType: ModActionType.ChangeUsername, newUsername: 'not valid!' });

            expect(result.success).toBeFalse();
            expect(db.modActions.size).toBe(0);
            expect(profile().username).toBe('BadName');
        });
    });

    describe('issuing a forced Rename', function() {
        it('rejects a blocked player through the submission handler without recording a rename', async function() {
            await submit({ actionType: ModActionType.UsernameChangesBlocked });
            const blockId = modActions.getActiveUsernameChangesBlockedActionId(playerId);

            const result = await submit({ actionType: ModActionType.Rename });

            expect(result).toEqual({
                success: false,
                message: 'Force Rename is unavailable while username changes are blocked. Use Change Username instead.',
            });
            expect(db.actionsOfType(ModActionType.Rename)).toEqual([]);
            expect(db.modActions.size).toBe(1);
            expect(modActions.playerActiveRename(playerId)).toBeFalsy();
            expect(modActions.getActiveUsernameChangesBlockedActionId(playerId)).toBe(blockId);
            expect(profile().username).toBe('BadName');
            expect(db.usernameChanges).toEqual([]);
        });

        it('enforces the restriction for callers that submit directly to the mod action service', async function() {
            await submit({ actionType: ModActionType.UsernameChangesBlocked });

            const result = await modActions.onActionSubmitted(playerId, ModActionType.Rename, moderator.moderatorId, moderator.moderatorUsername, '');

            expect(result.success).toBeFalse();
            expect(result.message).toContain('Use Change Username instead');
            expect(db.actionsOfType(ModActionType.Rename)).toEqual([]);
            expect(modActions.playerActiveRename(playerId)).toBeFalsy();
        });

        it('still permits a forced rename when username changes are not blocked', async function() {
            const result = await submit({ actionType: ModActionType.Rename });

            expect(result.success).toBeTrue();
            expect(modActions.playerActiveRename(playerId)).toBeTruthy();
            expect(db.actionsOfType(ModActionType.Rename)).toHaveSize(1);
            expect(db.actionsOfType(ModActionType.Rename)[0].active).toBeTrue();
            expect(profile().username).toBe('BadName');
        });

        it('permits a forced rename again after the username-change block is cancelled', async function() {
            await submit({ actionType: ModActionType.UsernameChangesBlocked });
            const blockId = modActions.getActiveUsernameChangesBlockedActionId(playerId);
            await modActions.onActionCancelled(playerId, blockId, moderator.moderatorId, moderator.moderatorUsername);

            const result = await submit({ actionType: ModActionType.Rename });

            expect(result.success).toBeTrue();
            expect(modActions.isUsernameChangesBlocked(playerId)).toBeFalse();
            expect(modActions.playerActiveRename(playerId)).toBeTruthy();
            expect(db.actionsOfType(ModActionType.Rename)).toHaveSize(1);
        });
    });

    describe('a pending forced Rename', function() {
        it('is resolved by a moderator rename', async function() {
            await modActions.onActionSubmitted(playerId, ModActionType.Rename, moderator.moderatorId, moderator.moderatorUsername, '');
            expect(modActions.playerActiveRename(playerId)).toBeTruthy();

            await submit({ actionType: ModActionType.ChangeUsername, newUsername: 'ApprovedName' });

            expect(modActions.playerActiveRename(playerId)).toBeFalsy();
            expect(db.actionsOfType(ModActionType.Rename)[0].active).toBeFalse();
        });

        it('is resolved by the username reset', async function() {
            await modActions.onActionSubmitted(playerId, ModActionType.Rename, moderator.moderatorId, moderator.moderatorUsername, '');

            await submit({ actionType: ModActionType.UsernameChangesBlocked });
            await submit({ actionType: ModActionType.ChangeUsername, newUsername: 'KaraUser0427' });

            expect(modActions.playerActiveRename(playerId)).toBeFalsy();
            expect(modActions.isUsernameChangesBlocked(playerId)).toBeTrue();
        });
    });

    describe('the one-time notice', function() {
        it('is unseen until the player acknowledges it, and shows again for a re-issued block', async function() {
            await submit({ actionType: ModActionType.UsernameChangesBlocked });
            const firstBlockId = modActions.getActiveUsernameChangesBlockedActionId(playerId);
            expect(noticeSeen()).toBeFalse();

            await userFactory.setUsernameChangesBlockedSeenAsync(playerId, firstBlockId);
            expect(noticeSeen()).toBeTrue();

            await modActions.onActionCancelled(playerId, firstBlockId, moderator.moderatorId, moderator.moderatorUsername);
            expect(modActions.isUsernameChangesBlocked(playerId)).toBeFalse();

            await submit({ actionType: ModActionType.UsernameChangesBlocked });
            expect(modActions.getActiveUsernameChangesBlockedActionId(playerId)).not.toBe(firstBlockId);
            expect(noticeSeen()).toBeFalse();
        });
    });

    describe('restarting the server', function() {
        it('rebuilds the block from the active index, and does not resurrect a cancelled one', async function() {
            await submit({ actionType: ModActionType.UsernameChangesBlocked });
            await submit({ actionType: ModActionType.ChangeUsername, newUsername: 'KaraUser0427' });
            await submit({ actionType: ModActionType.ChangeUsername, newUsername: 'ApprovedName' });

            const restarted = await ModActionService.createAsync();
            expect(restarted.isUsernameChangesBlocked(playerId)).toBeTrue();

            await modActions.onActionCancelled(playerId, modActions.getActiveUsernameChangesBlockedActionId(playerId), moderator.moderatorId, moderator.moderatorUsername);
            const restartedAgain = await ModActionService.createAsync();
            expect(restartedAgain.isUsernameChangesBlocked(playerId)).toBeFalse();
        });

        it('serves the full mod action history, including the new action types', async function() {
            await submit({ actionType: ModActionType.UsernameChangesBlocked });
            await submit({ actionType: ModActionType.ChangeUsername, newUsername: 'KaraUser0427' });
            await submit({ actionType: ModActionType.ChangeUsername, newUsername: 'ApprovedName' });

            const history = await userFactory.getModActionHistoryAsync(playerId);

            expect(history.map((action) => action.actionType).sort()).toEqual([
                ModActionType.ChangeUsername,
                ModActionType.ChangeUsername,
                ModActionType.UsernameChangesBlocked,
            ]);
        });
    });

    describe('migrating legacy mustRequestUsernameChange data', function() {
        const migrationOptions = { apply: true, moderatorId: 'migration', moderatorUsername: 'migration' };

        beforeEach(function() {
            db.addProfile({ id: 'unseen-player', username: 'Unseen', mustRequestUsernameChange: ModerationFieldState.Enabled });
            db.addProfile({ id: 'seen-player', username: 'Seen', mustRequestUsernameChange: ModerationFieldState.EnabledAndSeen });
        });

        it('produces data the runtime reads as blocked, with the notice state carried over', async function() {
            const summary = await migrateMustRequestUsernameChangeAsync(db, migrationOptions);
            const restarted = await ModActionService.createAsync();

            expect(summary.failures).toEqual([]);
            for (const [id, expectSeen] of [['unseen-player', false], ['seen-player', true]] as [string, boolean][]) {
                const activeId = restarted.getActiveUsernameChangesBlockedActionId(id);
                expect(activeId).toBeTruthy();
                expect(db.profiles.get(id).usernameChangesBlockedSeenActionId === activeId).toBe(expectSeen);
                expect(db.profiles.get(id).mustRequestUsernameChange).toBeUndefined();
            }
            expect(restarted.isUsernameChangesBlocked(playerId)).toBeFalse();
        });

        it('keeps migrated players blocked from renaming themselves', async function() {
            await migrateMustRequestUsernameChangeAsync(db, migrationOptions);
            const restarted = await ModActionService.createAsync();

            const eligibility = await userFactory.canChangeUsernameAsync('unseen-player', { usernameChangesBlocked: restarted.isUsernameChangesBlocked('unseen-player') });

            expect(eligibility.canChange).toBeFalse();
        });

        it('lets moderators cancel a migrated block like any other', async function() {
            await migrateMustRequestUsernameChangeAsync(db, migrationOptions);
            const restarted = await ModActionService.createAsync();

            await restarted.onActionCancelled('seen-player', restarted.getActiveUsernameChangesBlockedActionId('seen-player'), 'mod-1', 'ModOne');

            expect(restarted.isUsernameChangesBlocked('seen-player')).toBeFalse();
        });
    });
});
