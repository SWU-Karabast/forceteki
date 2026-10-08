import * as DynamoDBServiceModule from '../../../../server/services/DynamoDBService';
import type { IUserProfileDataEntity } from '../../../../server/services/DynamoDBInterfaces';
import { ModerationFieldState, UsernameChangeSource } from '../../../../server/services/DynamoDBInterfaces';
import { UserFactory } from '../../../../server/utils/user/UserFactory';

type DynamoDBService = Awaited<ReturnType<typeof DynamoDBServiceModule.getDynamoDbServiceAsync>>;

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

        it('allows a forced rename even when the player must request username changes', async function() {
            profile.mustRequestUsernameChange = ModerationFieldState.Enabled;

            const result = await userFactory.changeUsernameAsync(userId, 'NewName', forcedRename);

            expect(result.success).toBeTrue();
        });

        it('still blocks voluntary renames when the player must request username changes', async function() {
            profile.mustRequestUsernameChange = ModerationFieldState.Enabled;
            profile.usernameLastUpdatedAt = daysAgo(60);

            const result = await userFactory.changeUsernameAsync(userId, 'NewName');

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
            const result = await userFactory.canChangeUsernameAsync(userId, true);

            expect(result.canChange).toBeTrue();
        });

        it('allows the change when a Rename mod action is active and the player must request username changes', async function() {
            profile.mustRequestUsernameChange = ModerationFieldState.Enabled;

            const result = await userFactory.canChangeUsernameAsync(userId, true);

            expect(result.canChange).toBeTrue();
        });
    });
});
