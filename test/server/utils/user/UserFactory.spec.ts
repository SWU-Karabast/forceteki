import * as DynamoDBServiceModule from '../../../../server/services/DynamoDBService';
import type { DynamoDBService } from '../../../../server/services/DynamoDBService';
import type { IUserProfileDataEntity } from '../../../../server/services/DynamoDBInterfaces';
import { UsernameChangeSource } from '../../../../server/services/DynamoDBInterfaces';
import { UserFactory } from '../../../../server/utils/user/UserFactory';

describe('UserFactory username changes', function() {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const userId = 'player-id';
    const forcedRename = { source: UsernameChangeSource.ForcedRename, relatedModActionId: 'mod-action-id' };

    const daysAgo = (days: number): string => new Date(Date.now() - days * MS_PER_DAY).toISOString();

    let profile: Partial<IUserProfileDataEntity>;
    let fakeDb: jasmine.SpyObj<DynamoDBService>;
    let userFactory: UserFactory;

    beforeEach(function() {
        // Account older than the free first week, renamed voluntarily 5 days ago: inside the 30-day cooldown
        profile = {
            id: userId,
            username: 'OldName',
            createdAt: daysAgo(100),
            usernameLastUpdatedAt: daysAgo(5),
        };

        fakeDb = jasmine.createSpyObj<DynamoDBService>('DynamoDBService', [
            'getUserProfileAsync',
            'deleteUsernameLinkAsync',
            'saveUsernameLinkAsync',
            'updateUserProfileAsync',
            'saveUsernameChangeAsync',
        ]);
        fakeDb.getUserProfileAsync.and.callFake(() => {
            const storedProfile: Partial<IUserProfileDataEntity> = { ...profile };
            return Promise.resolve(storedProfile as IUserProfileDataEntity);
        });
        fakeDb.deleteUsernameLinkAsync.and.resolveTo();
        fakeDb.saveUsernameLinkAsync.and.resolveTo();
        // Persist partial updates like DynamoDB's SET expression does, so follow-up calls see them
        fakeDb.updateUserProfileAsync.and.callFake((_id: string, updates: Partial<IUserProfileDataEntity>) => {
            profile = { ...profile, ...updates };
            return Promise.resolve(null);
        });
        fakeDb.saveUsernameChangeAsync.and.resolveTo();

        spyOn(DynamoDBServiceModule, 'getDynamoDbServiceAsync').and.resolveTo(fakeDb);
        userFactory = new UserFactory();
    });

    const lastProfileUpdate = (): Partial<IUserProfileDataEntity> => fakeDb.updateUserProfileAsync.calls.mostRecent().args[1];

    describe('changeUsernameAsync', function() {
        it('rejects an invalid username without touching the database', async function() {
            const result = await userFactory.changeUsernameAsync(userId, 'New Name', forcedRename);

            expect(result.success).toBeFalse();
            expect(result.message).toBe('Username can only contain letters, numbers, underscores (_), and periods (.).');
            expect(fakeDb.getUserProfileAsync).not.toHaveBeenCalled();
            expect(fakeDb.saveUsernameLinkAsync).not.toHaveBeenCalled();
            expect(fakeDb.updateUserProfileAsync).not.toHaveBeenCalled();
        });

        it('rejects a voluntary rename inside the 30-day cooldown', async function() {
            const result = await userFactory.changeUsernameAsync(userId, 'NewName');

            expect(result.success).toBeFalse();
            expect(result.daysRemaining).toBe(25);
            expect(fakeDb.updateUserProfileAsync).not.toHaveBeenCalled();
        });

        it('allows a forced rename inside the 30-day cooldown', async function() {
            const result = await userFactory.changeUsernameAsync(userId, 'NewName', forcedRename);

            expect(result.success).toBeTrue();
            expect(fakeDb.updateUserProfileAsync).toHaveBeenCalledOnceWith(userId, jasmine.objectContaining({ username: 'NewName' }));
            expect(fakeDb.saveUsernameChangeAsync).toHaveBeenCalledOnceWith(jasmine.objectContaining({
                source: UsernameChangeSource.ForcedRename,
                relatedModActionId: 'mod-action-id',
            }));
        });

        it('allows a forced rename even when username changes are blocked', async function() {
            const result = await userFactory.changeUsernameAsync(userId, 'NewName', { ...forcedRename, usernameChangesBlocked: true });

            expect(result.success).toBeTrue();
        });

        it('still blocks voluntary renames when username changes are blocked', async function() {
            profile.usernameLastUpdatedAt = daysAgo(60);

            const result = await userFactory.changeUsernameAsync(userId, 'NewName', { usernameChangesBlocked: true });

            expect(result.success).toBeFalse();
            expect(fakeDb.updateUserProfileAsync).not.toHaveBeenCalled();
        });

        it('blocks a voluntary rename inside the free first week when username changes are blocked', async function() {
            profile.createdAt = daysAgo(2);
            profile.usernameLastUpdatedAt = undefined;

            const result = await userFactory.changeUsernameAsync(userId, 'NewName', { usernameChangesBlocked: true });

            expect(result.success).toBeFalse();
            expect(fakeDb.updateUserProfileAsync).not.toHaveBeenCalled();
        });

        it('rejects renaming to the current username', async function() {
            profile.usernameLastUpdatedAt = daysAgo(60);

            const result = await userFactory.changeUsernameAsync(userId, 'OldName');

            expect(result.success).toBeFalse();
            expect(fakeDb.updateUserProfileAsync).not.toHaveBeenCalled();
        });

        it('does not reset the cooldown on a forced rename', async function() {
            await userFactory.changeUsernameAsync(userId, 'NewName', forcedRename);

            expect(lastProfileUpdate().usernameLastUpdatedAt).toBeUndefined();
            expect(lastProfileUpdate().needsUsernameChange).toBeFalse();
        });

        it('does not cost a new account its free first-week renames', async function() {
            profile.createdAt = daysAgo(2);
            profile.usernameLastUpdatedAt = undefined;

            await userFactory.changeUsernameAsync(userId, 'NewName', forcedRename);
            expect(lastProfileUpdate().usernameLastUpdatedAt).toBeUndefined();

            // Jump to day 31: without a voluntary rename the cooldown counts from account creation, exactly as if
            // the forced rename had never happened. Previously the forced rename reset it, blocking until day 32.
            profile.createdAt = daysAgo(31);
            const result = await userFactory.changeUsernameAsync(userId, 'ChosenName');
            expect(result.success).toBeTrue();
        });

        it('treats the legacy needsUsernameChange flag as a forced rename', async function() {
            profile.needsUsernameChange = true;

            const result = await userFactory.changeUsernameAsync(userId, 'NewName');

            expect(result.success).toBeTrue();
            expect(lastProfileUpdate().usernameLastUpdatedAt).toBeUndefined();
        });

        it('starts the cooldown on a voluntary rename', async function() {
            profile.usernameLastUpdatedAt = daysAgo(60);

            const result = await userFactory.changeUsernameAsync(userId, 'NewName');

            expect(result.success).toBeTrue();
            expect(lastProfileUpdate().usernameLastUpdatedAt).toEqual(jasmine.any(String));
        });
    });

    describe('canChangeUsernameAsync', function() {
        it('reports the cooldown when there is no forced rename', async function() {
            const result = await userFactory.canChangeUsernameAsync(userId);

            expect(result.canChange).toBeFalse();
        });

        it('allows the change inside the cooldown when a Rename mod action is active', async function() {
            const result = await userFactory.canChangeUsernameAsync(userId, { hasActiveForcedRename: true });

            expect(result.canChange).toBeTrue();
        });

        it('allows the change when a Rename mod action is active and username changes are blocked', async function() {
            const result = await userFactory.canChangeUsernameAsync(userId, { hasActiveForcedRename: true, usernameChangesBlocked: true });

            expect(result.canChange).toBeTrue();
        });

        it('reports the block, ahead of the free first week and the cooldown', async function() {
            profile.createdAt = daysAgo(2);

            const result = await userFactory.canChangeUsernameAsync(userId, { usernameChangesBlocked: true });

            expect(result.canChange).toBeFalse();
            expect(result.message).toBe('You must submit a ticket to request a username change.');
        });

        it('keeps the existing messages for the first week and the elapsed cooldown', async function() {
            profile.createdAt = daysAgo(2);
            expect(await userFactory.canChangeUsernameAsync(userId)).toEqual({
                canChange: true,
                message: 'You can change your username freely within the first week',
                typeOfMessage: 'green',
            });

            profile.createdAt = daysAgo(100);
            profile.usernameLastUpdatedAt = daysAgo(60);
            expect(await userFactory.canChangeUsernameAsync(userId)).toEqual({
                canChange: true,
                message: 'You can change your username (available every 30 days)',
                typeOfMessage: 'yellow',
            });
        });
    });

    describe('changeUsernameByModeratorAsync', function() {
        const modActionId = 'moderator-action-id';

        it('renames inside the cooldown, moving the lookup link and updating the profile', async function() {
            const result = await userFactory.changeUsernameByModeratorAsync(userId, 'KaraUser0427', modActionId);

            expect(result).toEqual({ success: true, previousUsername: 'OldName', historyRecorded: true });
            expect(fakeDb.deleteUsernameLinkAsync).toHaveBeenCalledOnceWith('OldName', userId);
            expect(fakeDb.saveUsernameLinkAsync).toHaveBeenCalledOnceWith('KaraUser0427', userId);
            expect(fakeDb.updateUserProfileAsync).toHaveBeenCalledOnceWith(userId, jasmine.objectContaining({ username: 'KaraUser0427' }));
        });

        it('never starts the cooldown and clears the legacy forced-rename flag', async function() {
            profile.needsUsernameChange = true;

            await userFactory.changeUsernameByModeratorAsync(userId, 'KaraUser0427', modActionId);

            expect(lastProfileUpdate().usernameLastUpdatedAt).toBeUndefined();
            expect(lastProfileUpdate().needsUsernameChange).toBeFalse();
        });

        it('records a moderator history entry linked to the mod action', async function() {
            await userFactory.changeUsernameByModeratorAsync(userId, 'KaraUser0427', modActionId);

            expect(fakeDb.saveUsernameChangeAsync).toHaveBeenCalledOnceWith(jasmine.objectContaining({
                playerId: userId,
                previousUsername: 'OldName',
                newUsername: 'KaraUser0427',
                source: UsernameChangeSource.UsernameChangedByModerator,
                relatedModActionId: modActionId,
            }));
        });

        it('reports a missing history entry without failing the committed rename', async function() {
            fakeDb.saveUsernameChangeAsync.and.rejectWith(new Error('history write failed'));

            const result = await userFactory.changeUsernameByModeratorAsync(userId, 'KaraUser0427', modActionId);

            expect(result.success).toBeTrue();
            expect(result.historyRecorded).toBeFalse();
            expect(profile.username).toBe('KaraUser0427');
        });

        it('rejects the current username without writing anything', async function() {
            const result = await userFactory.changeUsernameByModeratorAsync(userId, 'OldName', modActionId);

            expect(result.success).toBeFalse();
            expect(fakeDb.deleteUsernameLinkAsync).not.toHaveBeenCalled();
            expect(fakeDb.updateUserProfileAsync).not.toHaveBeenCalled();
            expect(fakeDb.saveUsernameChangeAsync).not.toHaveBeenCalled();
        });

        it('propagates a failure to move the lookup link', async function() {
            fakeDb.saveUsernameLinkAsync.and.rejectWith(new Error('link write failed'));

            await expectAsync(userFactory.changeUsernameByModeratorAsync(userId, 'KaraUser0427', modActionId)).toBeRejectedWithError('link write failed');
            expect(fakeDb.saveUsernameChangeAsync).not.toHaveBeenCalled();
        });
    });

    describe('setUsernameChangesBlockedSeenAsync', function() {
        it('stores the acknowledged action id on the profile', async function() {
            const updated = await userFactory.setUsernameChangesBlockedSeenAsync(userId, 'block-action-id');

            expect(updated).toBeTrue();
            expect(lastProfileUpdate()).toEqual({ usernameChangesBlockedSeenActionId: 'block-action-id' });
        });

        it('does nothing when that action was already acknowledged', async function() {
            profile.usernameChangesBlockedSeenActionId = 'block-action-id';

            const updated = await userFactory.setUsernameChangesBlockedSeenAsync(userId, 'block-action-id');

            expect(updated).toBeFalse();
            expect(fakeDb.updateUserProfileAsync).not.toHaveBeenCalled();
        });

        it('shows a re-issued restriction again by recording the new action id', async function() {
            profile.usernameChangesBlockedSeenActionId = 'first-block-action-id';

            const updated = await userFactory.setUsernameChangesBlockedSeenAsync(userId, 'second-block-action-id');

            expect(updated).toBeTrue();
            expect(lastProfileUpdate().usernameChangesBlockedSeenActionId).toBe('second-block-action-id');
        });
    });

    describe('getUsernameAsync', function() {
        it('returns the current username', async function() {
            expect(await userFactory.getUsernameAsync(userId)).toBe('OldName');
        });

        it('returns null when the profile does not exist', async function() {
            fakeDb.getUserProfileAsync.and.resolveTo(undefined);

            expect(await userFactory.getUsernameAsync('missing-player')).toBeNull();
        });
    });
});
