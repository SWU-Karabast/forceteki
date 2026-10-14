import { serverIntegration } from '../../helpers/server/ServerIntegrationHelper';

describe('GameServer user API', function () {
    serverIntegration(function (contextRef) {
        describe('PUT /api/user/:userId/preferences', function () {
            let preferenceWrites: string[];

            beforeEach(function () {
                preferenceWrites = [];

                // the test server has no database, so record the write instead of making it
                (contextRef.harness.server as any).userFactory.updateUserPreferencesAsync = (userId: string) => {
                    preferenceWrites.push(userId);
                    return Promise.resolve();
                };
            });

            it('saves the caller\'s own preferences', async function () {
                const user = contextRef.harness.createClient({ authenticated: true });

                const response = await user.savePreferencesAsync(user.id, { gameOptions: { muteChat: true } });

                expect(response.status).toBe(200);
                expect(preferenceWrites).toEqual([user.id]);
            });

            it('refuses to save another user\'s preferences', async function () {
                const attacker = contextRef.harness.createClient({ authenticated: true });
                const victim = contextRef.harness.createClient({ authenticated: true });

                const response = await attacker.savePreferencesAsync(victim.id, { gameOptions: { muteChat: true } });

                expect(response.status).toBe(403);
                expect(preferenceWrites).toEqual([]);
            });

            it('refuses an anonymous user', async function () {
                const anonymous = contextRef.harness.createClient();

                const response = await anonymous.savePreferencesAsync(anonymous.id, { gameOptions: { muteChat: true } });

                expect(response.status).toBe(401);
                expect(preferenceWrites).toEqual([]);
            });
        });
    });
});
