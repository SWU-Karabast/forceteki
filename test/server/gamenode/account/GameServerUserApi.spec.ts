import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';

describe('GameServer user API', function () {
    serverIntegration(function (contextRef) {
        describe('PUT /api/user/:userId/preferences', function () {
            it('saves the caller\'s own preferences', async function () {
                const { harness } = contextRef;
                const user = harness.createAccountClient();

                const response = await user.savePreferencesAsync(user.id, { gameOptions: { muteChat: true } });

                expect(response.status).toBe(200);
                expect(harness.db.profiles.get(user.id).preferences.gameOptions.muteChat).toBeTrue();
            });

            it('keeps the preferences the caller did not send', async function () {
                const { harness } = contextRef;
                const user = harness.createAccountClient(harness.db.seedAccount({
                    profile: { preferences: { sound: { muteAllSound: true }, gameOptions: { muteChat: true } } },
                }));

                await user.savePreferencesAsync(user.id, { gameOptions: { muteChat: false } });

                const saved = harness.db.profiles.get(user.id).preferences;
                expect(saved.gameOptions.muteChat).toBeFalse();
                expect(saved.sound.muteAllSound).toBeTrue();
            });

            it('refuses to save another user\'s preferences', async function () {
                const { harness } = contextRef;
                const attacker = harness.createAccountClient();
                const victim = harness.createAccountClient();
                const before = structuredClone(harness.db.profiles.get(victim.id).preferences);

                const response = await attacker.savePreferencesAsync(victim.id, { gameOptions: { muteChat: true } });

                expect(response.status).toBe(403);
                expect(harness.db.profiles.get(victim.id).preferences).toEqual(before);
            });

            it('refuses an anonymous user', async function () {
                const { harness } = contextRef;
                const anonymous = harness.createClient();

                const response = await anonymous.savePreferencesAsync(anonymous.id, { gameOptions: { muteChat: true } });

                expect(response.status).toBe(401);
                expect(harness.db.profiles.has(anonymous.id)).toBeFalse();
            });
        });
    }, { database: true });
});
