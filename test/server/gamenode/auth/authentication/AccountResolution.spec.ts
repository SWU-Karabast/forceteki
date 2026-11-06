import { mintSessionToken, sessionCookie, signInClaims } from '../../../../helpers/server/AuthTokens';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../../helpers/server/ServerTestHarness';
import type { ISeededAccount } from '../../../../helpers/server/FakeDynamoDbService';
import { defaultProfileTtlMs } from '../../../../../server/utils/user/UserProfileCache';

/**
 * That the account behind a session is read from the database once and then held by the server, and that
 * anything the server changes about it is what the next request sees.
 */
describe('Account resolution', function () {
    const cookieFor = (account: ISeededAccount) => sessionCookie(mintSessionToken(signInClaims(account)));

    const getUserAsync = async (harness: ServerTestHarness, account: ISeededAccount) =>
        await harness.requestAsync('post', '/api/get-user', { cookie: cookieFor(account) });

    describe('reading the account', function () {
        serverIntegration(function (contextRef) {
            it('reads the identity link and the profile once across requests and socket connections', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount();
                const identityReads = spyOn(harness.db, 'getUserIdByOAuthAsync').and.callThrough();
                const profileReads = spyOn(harness.db, 'getUserProfileAsync').and.callThrough();
                const client = harness.createAccountClient(account);

                await getUserAsync(harness, account);
                await getUserAsync(harness, account);
                await harness.openLobbyAsync(client);

                expect(identityReads).toHaveBeenCalledTimes(1);
                expect(profileReads).toHaveBeenCalledTimes(1);
            });

            it('serves two sign-ins linked to one account from a single stored profile', async function () {
                const { harness } = contextRef;
                const discord = harness.db.seedAccount({ provider: 'discord', providerId: '1' });
                const google = { ...discord, provider: 'google', providerId: '2' };
                harness.db.oauthLinks.set('google_2', discord.id);
                const profileReads = spyOn(harness.db, 'getUserProfileAsync').and.callThrough();

                const first = await getUserAsync(harness, discord);
                const second = await getUserAsync(harness, google);

                expect(second.body.user.id).toBe(first.body.user.id);
                expect(profileReads).toHaveBeenCalledTimes(1);
            });

            it('does not let a response be changed by a later request for another account', async function () {
                const { harness } = contextRef;
                const one = harness.db.seedAccount({ username: 'PlayerOne' });
                const two = harness.db.seedAccount({ username: 'PlayerTwo' });

                const first = await getUserAsync(harness, one);
                const second = await getUserAsync(harness, two);

                expect(first.body.user.username).toBe('PlayerOne');
                expect(second.body.user.username).toBe('PlayerTwo');
            });

            it('sees a change made outside the server once the profile it holds has expired on the virtual clock', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ username: 'BeforeEdit' });
                await getUserAsync(harness, account);

                // written straight to the database, as another node or an admin edit would
                harness.db.profiles.set(account.id, { ...harness.db.profiles.get(account.id), username: 'AfterEdit' });
                await harness.clock.advanceAsync(defaultProfileTtlMs - 1);
                const whileHeld = await getUserAsync(harness, account);
                await harness.clock.advanceAsync(1);
                const afterExpiry = await getUserAsync(harness, account);

                expect(whileHeld.body.user.username).toBe('BeforeEdit');
                expect(afterExpiry.body.user.username).toBe('AfterEdit');
            });
        });
    });

    describe('after the server changes the account', function () {
        serverIntegration(function (contextRef) {
            it('shows saved preferences on the next request', async function () {
                const { harness } = contextRef;
                const client = harness.createAccountClient();
                await client.requestAsync('post', '/api/get-user');

                const saved = await client.savePreferencesAsync({ gameOptions: { muteChat: true } });
                const response = await client.requestAsync('post', '/api/get-user');

                expect(saved.status).toBe(200);
                expect(response.body.user.preferences.gameOptions.muteChat).toBeTrue();
            });

            it('shows the welcome message being dismissed on the next request', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ profile: { showWelcomeMessage: true } });
                const before = await getUserAsync(harness, account);

                await harness.requestAsync('post', '/api/toggle-welcome-message', { cookie: cookieFor(account) });
                const after = await getUserAsync(harness, account);

                expect(before.body.user.showWelcomeMessage).toBeTrue();
                expect(after.body.user.showWelcomeMessage).toBeFalse();
            });

            it('shows a changed username on the next request, and to a socket that connects afterwards', async function () {
                const { harness } = contextRef;
                const account = harness.db.seedAccount({ username: 'OldName' });
                await getUserAsync(harness, account);

                const changed = await harness.requestAsync('post', '/api/change-username', {
                    cookie: cookieFor(account),
                    body: { newUsername: 'NewName' },
                });
                const response = await getUserAsync(harness, account);
                // joining an open lobby by its link adds the user under the name its socket resolved to
                const owner = await harness.openLobbyAsync();
                const client = harness.createAccountClient(account);
                await client.connectAsync({ lobbyId: owner.lobbyId });

                expect(changed.status).toBe(200);
                expect(response.body.user.username).toBe('NewName');
                expect(client.lobbyState.users).toContain(jasmine.objectContaining({ id: account.id, username: 'NewName' }));
            });

            it('reads the profile again after a save, so a later request never sees the old values', async function () {
                const { harness } = contextRef;
                const client = harness.createAccountClient();
                await client.requestAsync('post', '/api/get-user');
                const profileReads = spyOn(harness.db, 'getUserProfileAsync').and.callThrough();

                await client.savePreferencesAsync({ gameOptions: { muteChat: true } });
                await client.requestAsync('post', '/api/get-user');
                await client.requestAsync('post', '/api/get-user');

                expect(profileReads).toHaveBeenCalledTimes(1);
            });

            it('does not keep a change that failed to save', async function () {
                const { harness } = contextRef;
                const client = harness.createAccountClient();
                await client.requestAsync('post', '/api/get-user');
                spyOn(harness.db, 'updateUserPreferencesAsync').and.rejectWith(new Error('write failed'));

                const saved = await client.savePreferencesAsync({ gameOptions: { muteChat: true } });
                const response = await client.requestAsync('post', '/api/get-user');

                expect(saved.status).toBe(500);
                expect(response.body.user.preferences.gameOptions.muteChat).toBeFalse();
            });
        });
    });
});
