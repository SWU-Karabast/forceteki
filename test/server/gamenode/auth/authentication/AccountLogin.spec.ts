import { UsernameChangeSource } from '../../../../../server/services/DynamoDBInterfaces';
import { getDefaultPreferences } from '../../../../../server/utils/user/UserFactory';
import { mintSessionToken, sessionCookie, signInClaims } from '../../../../helpers/server/AuthTokens';
import type { ISignInIdentity } from '../../../../helpers/server/AuthTokens';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../../helpers/server/ServerTestHarness';

const userKeysTheFrontEndReads = [
    'activeCosmetics',
    'id',
    'moderation',
    'needsUsernameChange',
    'preferences',
    'reportingDisabled',
    'showWelcomeMessage',
    'timerPopupSeenDate',
    'undoPopupSeenDate',
    'username',
    'usernameChangesBlocked',
];

/**
 * The FE's sign-in sequence: `/api/get-user`, and if the server has no account for the session yet,
 * `/api/create-user` followed by `/api/get-user` again.
 */
async function signInAsync(harness: ServerTestHarness, identity: ISignInIdentity) {
    const cookie = sessionCookie(mintSessionToken(signInClaims(identity)));
    const getUserAsync = async () => await harness.requestAsync('post', '/api/get-user', { cookie });

    const first = await getUserAsync();
    if (first.status === 401 && first.body.code === 'ACCOUNT_NOT_FOUND') {
        await harness.requestAsync('post', '/api/create-user', { cookie });
        return await getUserAsync();
    }

    return first;
}

/**
 * How a logged-in account comes to exist and is found again: a session token is resolved to an account by its
 * provider identity, and `/api/create-user` makes, finds or links one when the identity has none yet.
 *
 * These are what a refactor of account handling must not change silently - which provider identities map to
 * which account, what a new account starts with, and what the FE is told about it.
 */
describe('Account login', function () {
    describe('the first sign-in of an identity the server has never seen', function () {
        serverIntegration(function (contextRef) {
            const identity: ISignInIdentity = { username: ' Brand New! ', provider: 'discord', providerId: '4242', email: 'New.User@Example.test' };

            it('creates the account, its identity links and the first entry in its username history', async function () {
                const { harness } = contextRef;

                const response = await signInAsync(harness, identity);

                expect(response.status).toBe(200);
                const userId: string = response.body.user.id;
                expect(harness.db.profiles.size).toBe(1);
                expect(harness.db.profiles.get(userId)).toEqual(jasmine.objectContaining({ id: userId, username: 'BrandNew', showWelcomeMessage: true }));
                expect(harness.db.oauthLinks.get('discord_4242')).toBe(userId);
                expect(harness.db.emailLinks.get('new.user@example.test')).toBe(userId);
                expect([...harness.db.usernameLinks]).toEqual([`brandnew#${userId}`]);
                expect(harness.db.usernameChanges).toEqual([jasmine.objectContaining({
                    playerId: userId,
                    previousUsername: null,
                    newUsername: 'BrandNew',
                    source: UsernameChangeSource.AccountCreation,
                })]);
            });

            it('gives the account an id of its own, not the identity the provider supplied', async function () {
                const response = await signInAsync(contextRef.harness, identity);

                expect(response.body.user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
            });

            it('names the account after the provider\'s name with spaces and symbols removed', async function () {
                const response = await signInAsync(contextRef.harness, identity);

                expect(response.body.user.username).toBe('BrandNew');
            });

            it('starts the account with the default preferences and the welcome message on', async function () {
                const { harness } = contextRef;

                const response = await signInAsync(harness, identity);

                expect(response.body.user.showWelcomeMessage).toBeTrue();
                expect(response.body.user.preferences).toEqual(getDefaultPreferences());
            });

            it('records the first sync of the new account as a login', async function () {
                const { harness } = contextRef;

                const response = await signInAsync(harness, identity);

                expect(harness.db.loggedInUserIds).toEqual([response.body.user.id]);
            });
        });
    });

    describe('signing in again', function () {
        serverIntegration(function (contextRef) {
            it('finds the same account by its provider identity and records the login', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ username: 'StoredName' });

                const response = await signInAsync(harness, account);

                expect(response.status).toBe(200);
                expect(response.body.user).toEqual(jasmine.objectContaining({ id: account.id, username: 'StoredName' }));
                expect(harness.db.loggedInUserIds).toEqual([account.id]);
            });

            it('keeps the stored username when the provider now reports a different name', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ username: 'StoredName' });

                const response = await signInAsync(harness, { ...account, username: 'RenamedAtProvider' });

                expect(response.body.user.username).toBe('StoredName');
                expect(harness.db.profiles.size).toBe(1);
            });

            it('does not create a second account for an identity it has seen', async function () {
                const { harness } = contextRef;
                const identity: ISignInIdentity = { username: 'Returning', provider: 'discord', providerId: '77', email: 'returning@example.test' };

                const first = await signInAsync(harness, identity);
                const second = await signInAsync(harness, identity);

                expect(second.body.user.id).toBe(first.body.user.id);
                expect(harness.db.profiles.size).toBe(1);
                expect(harness.db.loggedInUserIds).toEqual([first.body.user.id, first.body.user.id]);
            });

            it('tells the FE what it reads of an account', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ username: 'StoredName' });

                const response = await signInAsync(harness, account);

                expect(response.body.success).toBeTrue();
                expect(Object.keys(response.body.user).sort()).toEqual(userKeysTheFrontEndReads);
                expect(response.body.user).toEqual(jasmine.objectContaining({
                    id: account.id,
                    username: 'StoredName',
                    showWelcomeMessage: false,
                    needsUsernameChange: false,
                    moderation: null,
                    reportingDisabled: null,
                    usernameChangesBlocked: null,
                }));
            });
        });
    });

    describe('signing in with a different provider but the same email', function () {
        serverIntegration(function (contextRef) {
            const googleIdentity = (email: string): ISignInIdentity => ({ username: 'Whoever', provider: 'google', providerId: '222', email });

            it('finds the existing account by email, ignoring case, and links the new provider to it', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ provider: 'discord', providerId: '111', email: 'shared@example.test' });

                const response = await signInAsync(harness, googleIdentity('Shared@Example.TEST'));

                expect(response.status).toBe(200);
                expect(response.body.user.id).toBe(account.id);
                expect(harness.db.oauthLinks.get('google_222')).toBe(account.id);
                expect(harness.db.profiles.size).toBe(1);
                expect(harness.db.loggedInUserIds).toEqual([account.id]);
            });

            it('then recognises the new provider on its own', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ provider: 'discord', providerId: '111', email: 'shared@example.test' });
                await signInAsync(harness, googleIdentity('shared@example.test'));

                // the email no longer matters once the provider is linked
                const response = await signInAsync(harness, googleIdentity('changed-email@example.test'));

                expect(response.body.user.id).toBe(account.id);
                expect(harness.db.profiles.size).toBe(1);
            });
        });
    });

    describe('a sign-in whose email the provider has not verified', function () {
        serverIntegration(function (contextRef) {
            const emailNotVerified = { success: false, message: 'Authentication failed', code: 'EMAIL_NOT_VERIFIED' };

            function expectNoIdentityLinks(harness: ServerTestHarness, identity: ISignInIdentity): void {
                expect(harness.db.oauthLinks.has(`${identity.provider}_${identity.providerId}`)).withContext('identity link')
                    .toBeFalse();
            }

            for (const provider of ['discord', 'google']) {
                const unverified: ISignInIdentity = { username: 'Unverified', provider, providerId: '808', email: 'unverified@example.test', emailVerified: false };

                it(`is refused for a new ${provider} identity, and no account is created for it`, async function () {
                    const { harness } = contextRef;
                    const cookie = sessionCookie(mintSessionToken(signInClaims(unverified)));

                    const synced = await signInAsync(harness, unverified);
                    const created = await harness.requestAsync('post', '/api/create-user', { cookie });

                    expect(synced.status).toBe(401);
                    expect(synced.body).toEqual(emailNotVerified);
                    expect(created.status).toBe(401);
                    expect(created.body).toEqual(emailNotVerified);
                    expect(harness.db.profiles.size).toBe(0);
                    expect(harness.db.emailLinks.size).toBe(0);
                    expectNoIdentityLinks(harness, unverified);
                });

                it(`does not link a ${provider} identity to the account that has its email`, async function () {
                    const { harness } = contextRef;
                    const account = harness.db.seedAccount({ provider: 'other', providerId: '1', email: unverified.email });
                    const cookie = sessionCookie(mintSessionToken(signInClaims(unverified)));

                    const created = await harness.requestAsync('post', '/api/create-user', { cookie });

                    expect(created.status).toBe(401);
                    expect(created.body).toEqual(emailNotVerified);
                    expectNoIdentityLinks(harness, unverified);
                    expect(harness.db.emailLinks.get(unverified.email)).toBe(account.id);
                    expect(harness.db.profiles.size).toBe(1);
                });

                it(`is refused for a ${provider} identity already linked to an account`, async function () {
                    const { harness } = contextRef;
                    const account = harness.db.seedAccount({ provider, providerId: '909' });

                    const response = await signInAsync(harness, { ...account, emailVerified: false });

                    expect(response.status).toBe(401);
                    expect(response.body).toEqual(emailNotVerified);
                    expect(harness.db.loggedInUserIds).toEqual([]);
                });
            }

            it('signs in once the provider has verified the email', async function () {
                const { harness } = contextRef;
                const identity: ISignInIdentity = { username: 'Later', provider: 'discord', providerId: '707', email: 'later@example.test' };

                const refused = await signInAsync(harness, { ...identity, emailVerified: false });
                const accepted = await signInAsync(harness, identity);

                expect(refused.status).toBe(401);
                expect(accepted.status).toBe(200);
                expect(harness.db.oauthLinks.get('discord_707')).toBe(accepted.body.user.id);
            });
        });
    });

    describe('an identity linked to an account whose profile no longer exists', function () {
        serverIntegration(function (contextRef) {
            const identity: ISignInIdentity = { username: 'Orphan', provider: 'discord', providerId: '555', email: 'orphan@example.test' };

            it('signs the owner in to a new profile under the id the identity is linked to', async function () {
                const { harness } = contextRef;
                harness.db.oauthLinks.set('discord_555', 'account-with-no-profile');

                const response = await signInAsync(harness, identity);

                expect(response.status).toBe(200);
                expect(response.body.user.id).toBe('account-with-no-profile');
                expect(harness.db.profiles.size).toBe(1);
                expect(harness.db.oauthLinks.get('discord_555')).toBe('account-with-no-profile');
            });

            it('does not link the identity to another account that has the same email', async function () {
                const { harness } = contextRef;
                harness.db.oauthLinks.set('discord_555', 'account-with-no-profile');
                harness.db.seedAccount({ provider: 'google', providerId: '9', email: identity.email });

                const response = await signInAsync(harness, identity);

                expect(response.body.user.id).toBe('account-with-no-profile');
            });
        });
    });
});
