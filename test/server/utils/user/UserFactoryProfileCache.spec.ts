import { ModerationType } from '../../../../server/services/DynamoDBInterfaces';
import type { IUserDataEntity, IUserProfileDataEntity } from '../../../../server/services/DynamoDBInterfaces';
import { RefreshTokenSource } from '../../../../server/utils/statHandlers/StatHandlerTypes';
import { UserFactory } from '../../../../server/utils/user/UserFactory';
import { mintSessionToken, signInClaims } from '../../../helpers/server/AuthTokens';
import type { ISeededAccount } from '../../../helpers/server/FakeDynamoDbService';
import { FakeDynamoDbService } from '../../../helpers/server/FakeDynamoDbService';
import { routeDatabaseThrough } from '../../../helpers/server/TestDatabase';

/**
 * That an account the server has already resolved is read again, not served from its cache, after anything that
 * changes the stored profile - every write in `UserFactory` has to be followed by a fresh read.
 */
describe('UserFactory profile cache', function() {
    const HOUR_MS = 60 * 60 * 1000;

    let fakeDb: FakeDynamoDbService;
    let userFactory: UserFactory;
    let account: ISeededAccount;
    let token: string;

    const resolveProfileAsync = async (): Promise<IUserDataEntity> => (await userFactory.resolveUserFromTokenAsync(token)).userData;

    function seed(profile: Partial<IUserProfileDataEntity> = {}): void {
        account = fakeDb.seedAccount({ profile });
        token = mintSessionToken(signInClaims(account));
    }

    beforeEach(function() {
        fakeDb = new FakeDynamoDbService();
        routeDatabaseThrough(fakeDb);
        userFactory = new UserFactory();
    });

    describe('after a change made through the factory', function() {
        const changes: { description: string; seed?: Partial<IUserProfileDataEntity>; change: (id: string) => Promise<unknown>; expected: Partial<IUserProfileDataEntity> }[] = [
            {
                description: 'saved preferences',
                change: (id) => userFactory.updateUserPreferencesAsync(id, { gameOptions: { muteChat: true } }),
                expected: { preferences: jasmine.objectContaining({ gameOptions: jasmine.objectContaining({ muteChat: true }) }) as any },
            },
            {
                description: 'a linked SWUStats account',
                change: (id) => userFactory.addRefreshTokenAsync(id, 'stats-token', RefreshTokenSource.SWUStats),
                expected: { swuStatsRefreshToken: 'stats-token' },
            },
            {
                description: 'a linked SWUBase account',
                change: (id) => userFactory.addRefreshTokenAsync(id, 'base-token', RefreshTokenSource.SWUBase),
                expected: { swubaseRefreshToken: 'base-token' },
            },
            {
                description: 'an unlinked SWUStats account',
                seed: { swuStatsRefreshToken: 'stats-token' },
                change: (id) => userFactory.unlinkRefreshTokenAsync(id, RefreshTokenSource.SWUStats),
                expected: { swuStatsRefreshToken: null },
            },
            {
                description: 'the welcome message being dismissed',
                seed: { showWelcomeMessage: true },
                change: (id) => userFactory.setWelcomeMessageStatus(id),
                expected: { showWelcomeMessage: false },
            },
            {
                description: 'the undo popup being seen',
                change: (id) => userFactory.setUndoPopupSeenStatus(id),
                expected: { undoPopupSeenDate: jasmine.any(String) as any },
            },
            {
                description: 'the timer popup being seen',
                change: (id) => userFactory.setTimerPopupSeenStatus(id),
                expected: { timerPopupSeenDate: jasmine.any(String) as any },
            },
            {
                description: 'a reporting-disabled notice being seen',
                change: (id) => userFactory.setReportingDisabledSeenAsync(id, 'action-1'),
                expected: { reportingDisabledSeenActionId: 'action-1' },
            },
            {
                description: 'a username-changes-blocked notice being seen',
                change: (id) => userFactory.setUsernameChangesBlockedSeenAsync(id, 'action-2'),
                expected: { usernameChangesBlockedSeenActionId: 'action-2' },
            },
            {
                description: 'a legacy moderation notice being seen',
                seed: { moderation: { moderationType: ModerationType.Mute, daysRemaining: 3, endDate: new Date(Date.now() + 24 * HOUR_MS).toISOString(), hasSeen: false } },
                change: (id) => userFactory.setModerationSeenAsync(id),
                expected: { moderation: jasmine.objectContaining({ hasSeen: true }) as any },
            },
            {
                description: 'a username change',
                change: (id) => userFactory.changeUsernameAsync(id, 'RenamedPlayer'),
                expected: { username: 'RenamedPlayer' },
            },
            {
                description: 'a username change by a moderator',
                change: (id) => userFactory.changeUsernameByModeratorAsync(id, 'ModeratedName', 'mod-action-1'),
                expected: { username: 'ModeratedName' },
            },
        ];

        for (const { description, seed: seedProfile, change, expected } of changes) {
            it(`serves ${description} on the next resolve`, async function() {
                seed(seedProfile);
                await resolveProfileAsync();

                await change(account.id);

                expect(await resolveProfileAsync()).toEqual(jasmine.objectContaining(expected));
            });
        }

        it('reads the database once after a change, then serves later resolves from the cache', async function() {
            seed();
            await resolveProfileAsync();
            await userFactory.setWelcomeMessageStatus(account.id);
            const reads = spyOn(fakeDb, 'getUserProfileAsync').and.callThrough();

            await resolveProfileAsync();
            await resolveProfileAsync();

            expect(reads).toHaveBeenCalledTimes(1);
        });
    });

    describe('legacy moderation', function() {
        const mute = (endsInMs: number): IUserProfileDataEntity['moderation'] => ({
            moderationType: ModerationType.Mute,
            daysRemaining: 3,
            endDate: new Date(Date.now() + endsInMs).toISOString(),
            hasSeen: true,
        });

        it('is active while its end date has not passed', async function() {
            seed({ moderation: mute(2 * HOUR_MS) });

            await resolveProfileAsync();
            const user = await userFactory.resolveUserFromTokenAsync(token);

            expect(user.getModeration()?.moderationType).toBe(ModerationType.Mute);
        });

        it('is cleared when its end date passes while the profile is cached', async function() {
            seed({ moderation: mute(2 * HOUR_MS) });
            await resolveProfileAsync();
            const realNow = Date.now();
            spyOn(Date, 'now').and.returnValue(realNow + 3 * HOUR_MS);

            const user = await userFactory.resolveUserFromTokenAsync(token);

            expect(user.getModeration()).toBeNull();
            expect(fakeDb.profiles.get(account.id).moderation).toBeNull();
        });
    });

    describe('creating an account', function() {
        it('is still readable if its username history cannot be recorded', async function() {
            spyOn(fakeDb, 'saveUsernameChangeAsync').and.rejectWith(new Error('history unavailable'));
            const newcomerToken = mintSessionToken(signInClaims({ username: 'Newcomer', provider: 'discord', providerId: '900', email: 'newcomer@example.test' }));

            const created = await userFactory.createUserFromTokenAsync(newcomerToken);
            const resolved = await userFactory.resolveUserFromTokenAsync(newcomerToken);

            expect(resolved.getId()).toBe(created.getId());
        });
    });
});
