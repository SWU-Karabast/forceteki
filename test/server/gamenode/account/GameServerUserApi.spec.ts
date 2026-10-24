import { ModActionType } from '../../../../server/services/DynamoDBInterfaces';
import { mintSessionToken, sessionCookie, signInClaims } from '../../../helpers/server/AuthTokens';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';

describe('GameServer user API', function () {
    serverIntegration(function (contextRef) {
        describe('POST /api/get-user', function () {
            it('reports the time left on a moderator mute against the server\'s clock', async function () {
                const { harness } = contextRef;
                const user = harness.createAccountClient();
                await harness.server.modActionService.onActionSubmitted(user.id, ModActionType.Mute, 'moderator-id', 'Moderator', 'spamming', 3);

                const response = await user.requestAsync('post', '/api/get-user');

                expect(response.body.user.moderation.daysRemaining).toBe(3);
            });
        });

        describe('PUT /api/user/preferences', function () {
            it('saves the caller\'s own preferences', async function () {
                const { harness } = contextRef;
                const user = harness.createAccountClient();

                const response = await user.savePreferencesAsync({ gameOptions: { muteChat: true } });

                expect(response.status).toBe(200);
                expect(harness.db.profiles.get(user.id).preferences.gameOptions.muteChat).toBeTrue();
            });

            it('keeps the preferences the caller did not send', async function () {
                const { harness } = contextRef;
                const user = harness.createAccountClient(harness.db.seedAccount({
                    profile: { preferences: { sound: { muteAllSound: true }, gameOptions: { muteChat: true } } },
                }));

                await user.savePreferencesAsync({ gameOptions: { muteChat: false } });

                const saved = harness.db.profiles.get(user.id).preferences;
                expect(saved.gameOptions.muteChat).toBeFalse();
                expect(saved.sound.muteAllSound).toBeTrue();
            });

            it('ignores a supplied target user ID when saving preferences', async function () {
                const { harness } = contextRef;
                const attacker = harness.createAccountClient();
                const victim = harness.createAccountClient();
                const before = structuredClone(harness.db.profiles.get(victim.id).preferences);

                const response = await attacker.requestAsync('put', '/api/user/preferences', { userId: victim.id, preferences: { gameOptions: { muteChat: true } } });

                expect(response.status).toBe(200);
                expect(harness.db.profiles.get(victim.id).preferences).toEqual(before);
            });

            it('refuses an anonymous user', async function () {
                const { harness } = contextRef;
                const anonymous = harness.createClient();

                const response = await anonymous.savePreferencesAsync({ gameOptions: { muteChat: true } });

                expect(response.status).toBe(401);
                expect(harness.db.profiles.has(anonymous.id)).toBeFalse();
            });
        });
    }, { database: true });
});

describe('Development preferences without DynamoDB', function () {
    serverIntegration(function (contextRef) {
        it('persists a signed-in dev user preference through the API and a fresh user sync', async function () {
            const { harness } = contextRef;
            const cookie = sessionCookie(mintSessionToken(signInClaims({
                provider: 'dev-user', providerId: 'order66', username: 'Order66', email: 'order66@local.karabast',
            })));
            const initial = await harness.api.post('/api/get-user').set('Cookie', cookie)
                .send({});
            expect(initial.status).toBe(200);
            const value = !initial.body.user.preferences.sound.muteAllSound;
            const saved = await harness.api.put('/api/user/preferences').set('Cookie', cookie)
                .send({ preferences: { sound: { muteAllSound: value } } });
            expect(saved.status).toBe(200);
            const reloaded = await harness.api.post('/api/get-user').set('Cookie', cookie)
                .send({});
            expect(reloaded.status).toBe(200);
            expect(reloaded.body.user.preferences.sound.muteAllSound).toBe(value);
            expect(reloaded.body.user.id).toBe('exe66');
        });
    });
});
