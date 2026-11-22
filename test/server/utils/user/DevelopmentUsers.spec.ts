import * as UserStoreModule from '../../../../server/utils/user/UserStore';
import * as DynamoDBServiceModule from '../../../../server/services/DynamoDBService';
import { InMemoryUserStore } from '../../../../server/utils/user/InMemoryUserStore';
import { UserFactory } from '../../../../server/utils/user/UserFactory';
import { RefreshTokenSource } from '../../../../server/utils/statHandlers/StatHandlerTypes';
import { badSessionTokens, mintSessionToken, signInClaims } from '../../../helpers/server/AuthTokens';
import { overrideEnv } from '../../../helpers/server/ServerTestEnv';

describe('Development user storage', function() {
    const claims = signInClaims({ provider: 'dev-user', providerId: 'order66', username: 'Order66', email: 'order66@local.karabast' });
    let store: InMemoryUserStore;
    let factory: UserFactory;

    beforeEach(function() {
        store = new InMemoryUserStore();
        spyOn(UserStoreModule, 'getUserStoreAsync').and.resolveTo(store);
        factory = new UserFactory();
    });

    it('seeds both accounts and retains nested preferences across factory instances and logins', async function() {
        await factory.ensureDevelopmentTestUsersAsync();
        const user = await factory.createUserFromTokenAsync(mintSessionToken(claims));
        expect(user.getId()).toBe('exe66');
        expect(user.isAuthenticatedUser()).toBeTrue();
        await factory.updateUserPreferencesAsync(user.getId(), { sound: { muteChatSound: true }, gameOptions: { muteChat: true } });
        await factory.updateUserPreferencesAsync(user.getId(), { gameOptions: { autoResolve: { singleTarget: true } } });

        const reloaded = await new UserFactory().createUserFromTokenAsync(mintSessionToken(claims));
        expect(reloaded.getPreferences().sound.muteChatSound).toBeTrue();
        expect(reloaded.getPreferences().gameOptions.muteChat).toBeTrue();
        expect(reloaded.getPreferences().gameOptions.autoResolve.singleTarget).toBeTrue();
        const other = await factory.createDevelopmentTestUserAsync('this-is-the-way');
        expect(other.getId()).toBe('th3w4y');
        expect(other.getPreferences().gameOptions.muteChat).toBeFalse();

        reloaded.getPreferences().gameOptions.muteChat = false;
        expect((await factory.createDevelopmentTestUserAsync('order66')).getPreferences().gameOptions.muteChat).toBeTrue();
    });

    it('stores profile notices, refresh tokens, and username history without DynamoDB', async function() {
        await factory.ensureDevelopmentTestUsersAsync();
        await factory.setWelcomeMessageStatus('exe66');
        await factory.setUndoPopupSeenStatus('exe66');
        await factory.setTimerPopupSeenStatus('exe66');
        await factory.setUsernameChangesBlockedSeenAsync('exe66', 'rename-action');
        await factory.setReportingDisabledSeenAsync('exe66', 'report-action');
        await factory.addRefreshTokenAsync('exe66', 'local-refresh-token', RefreshTokenSource.SWUStats);
        expect(await factory.getUserRefreshTokenAsync('exe66', RefreshTokenSource.SWUStats)).toBe('local-refresh-token');
        await factory.unlinkRefreshTokenAsync('exe66', RefreshTokenSource.SWUStats);
        expect(await factory.getUserRefreshTokenAsync('exe66', RefreshTokenSource.SWUStats)).toBeNull();
        expect((await factory.changeUsernameAsync('exe66', 'RenamedOrder')).success).toBeTrue();
        await factory.ensureDevelopmentTestUsersAsync();
        const profile = await store.getUserProfileAsync('exe66');
        expect(profile.username).toBe('RenamedOrder');
        expect(profile.showWelcomeMessage).toBeFalse();
        expect(profile.undoPopupSeenDate).toBeTruthy();
        expect(profile.timerPopupSeenDate).toBeTruthy();
        expect(profile.usernameChangesBlockedSeenActionId).toBe('rename-action');
        expect(profile.reportingDisabledSeenActionId).toBe('report-action');
        expect(await store.getUserIdsByUsernameAsync('Order66')).toEqual([]);
        expect((await factory.getUsernameChangeHistoryAsync('exe66')).length).toBe(1);
        expect((await factory.createUserFromTokenAsync(mintSessionToken(claims))).getUsername()).toBe('RenamedOrder');
    });

    it('preserves existing OAuth IDs and other users with the same username during seeding', async function() {
        await store.saveOAuthLinkAsync('dev-user', 'order66', 'existing-local-account');
        await store.saveUserProfileAsync({ id: 'existing-local-account', username: 'RenamedOrder', showWelcomeMessage: false, lastLogin: new Date().toISOString(), createdAt: new Date().toISOString() });
        await store.saveUsernameLinkAsync('Order66', 'unrelated-account');
        await factory.ensureDevelopmentTestUsersAsync();
        expect((await factory.createDevelopmentTestUserAsync('order66')).getId()).toBe('existing-local-account');
        expect(await store.getUserIdsByUsernameAsync('Order66')).toEqual(['unrelated-account']);
        expect(await store.getUserIdsByUsernameAsync('RenamedOrder')).toEqual(['existing-local-account']);
    });

    for (const provider of ['google', 'discord']) {
        it(`authenticates ${provider} sessions through ordinary account storage`, async function() {
            const token = mintSessionToken(signInClaims({ provider, providerId: 'oauth-account', username: 'OAuthUser', email: 'oauth@example.test' }));
            const user = await factory.createUserFromTokenAsync(token);
            expect(user.isAuthenticatedUser()).toBeTrue();
            expect(user.getUsername()).toBe('OAuthUser');
            expect((await factory.createUserFromTokenAsync(token)).getId()).toBe(user.getId());
        });
    }

    // 'constructor' would pass a check that looked the id up as a key of a plain object
    for (const providerId of ['unknown', 'constructor']) {
        it(`rejects the unknown dev identity '${providerId}' without creating an account for it`, async function() {
            const token = mintSessionToken({ ...claims, providerId });

            await expectAsync(factory.resolveUserFromTokenAsync(token)).toBeRejectedWithError(/Unknown development test user/);
            await expectAsync(factory.createUserFromTokenAsync(token)).toBeRejectedWithError(/Unknown development test user/);
            expect(await store.getUserIdByOAuthAsync('dev-user', providerId)).toBeUndefined();
            expect(await store.getUserIdByEmailAsync('order66@local.karabast')).toBeUndefined();
        });
    }

    for (const invalid of badSessionTokens(claims)) {
        it(`rejects a development token ${invalid.description}`, async function() {
            await expectAsync(factory.createUserFromTokenAsync(invalid.token)).toBeRejected();
        });
    }

    it('rejects development authentication outside development even with a working store', async function() {
        const lookup = spyOn(store, 'getUserIdByOAuthAsync').and.callThrough();
        const restore = overrideEnv({ ENVIRONMENT: 'production' });
        try {
            await expectAsync(factory.resolveUserFromTokenAsync(mintSessionToken(claims))).toBeRejectedWithError(/only authenticate in development/);
            await expectAsync(factory.createUserFromTokenAsync(mintSessionToken(claims))).toBeRejectedWithError(/only authenticate in development/);
        } finally {
            restore();
        }
        expect(lookup).not.toHaveBeenCalled();
    });

    describe('on the request path', function() {
        const theWayClaims = signInClaims({ provider: 'dev-user', providerId: 'this-is-the-way', username: 'ThisIsTheWay', email: 'this-is-the-way@local.karabast' });

        it('seeds the test accounts for the first session, with no earlier seeding', async function() {
            const user = await factory.resolveUserFromTokenAsync(mintSessionToken(claims));

            expect(user.getId()).toBe('exe66');
            expect(await store.getUserIdByOAuthAsync('dev-user', 'this-is-the-way')).toBe('th3w4y');
        });

        it('seeds the test accounts only once per factory', async function() {
            const seed = spyOn(factory, 'ensureDevelopmentTestUsersAsync').and.callThrough();

            await factory.resolveUserFromTokenAsync(mintSessionToken(claims));
            await factory.resolveUserFromTokenAsync(mintSessionToken(theWayClaims));
            await factory.createUserFromTokenAsync(mintSessionToken(claims));

            expect(seed).toHaveBeenCalledTimes(1);
        });

        it('does not seed for a session from another provider', async function() {
            const seed = spyOn(factory, 'ensureDevelopmentTestUsersAsync').and.callThrough();

            await factory.createUserFromTokenAsync(mintSessionToken(signInClaims({ provider: 'google', providerId: 'oauth-account', username: 'OAuthUser', email: 'oauth@example.test' })));

            expect(seed).not.toHaveBeenCalled();
        });

        it('retries the seeding for the next session after a failed attempt', async function() {
            const save = spyOn(store, 'saveOAuthLinkAsync').and.rejectWith(new Error('store unavailable'));
            await expectAsync(factory.resolveUserFromTokenAsync(mintSessionToken(claims))).toBeRejectedWithError(/store unavailable/);

            save.and.callThrough();

            expect((await factory.resolveUserFromTokenAsync(mintSessionToken(claims))).getId()).toBe('exe66');
        });
    });
});

describe('User store selection', function() {
    it('shares the development store across factories when DynamoDB is disabled', async function() {
        spyOn(DynamoDBServiceModule, 'getDynamoDbServiceAsync').and.resolveTo(null);
        expect(await UserStoreModule.getUserStoreAsync()).toBe(await UserStoreModule.getUserStoreAsync());
    });

    it('does not fall back to memory outside development', async function() {
        spyOn(DynamoDBServiceModule, 'getDynamoDbServiceAsync').and.resolveTo(null);
        const restore = overrideEnv({ ENVIRONMENT: 'production' });
        try {
            await expectAsync(UserStoreModule.getUserStoreAsync()).toBeRejectedWithError(/only available in development/);
        } finally {
            restore();
        }
    });
});
