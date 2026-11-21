import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { TestClient } from '../../../helpers/server/TestClient';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

describe('Changing a username', function () {
    serverIntegration(function (contextRef) {
        async function usernameSeenByAsync(user: TestClient): Promise<string> {
            const response = await user.requestAsync('post', '/api/get-user');
            expect(response.status).withContext('reading the user back')
                .toBe(200);
            return response.body.user.username;
        }

        it('changes the caller\'s username, and a later read returns the new one', async function () {
            const { harness } = contextRef;
            const user = harness.createAccountClient(harness.db.seedAccount({ username: 'OldName' }));

            const response = await user.changeUsernameAsync('NewName');

            expect(response.status).toBe(200);
            expect(response.body.username).toBe('NewName');
            expect(await usernameSeenByAsync(user)).toBe('NewName');
        });

        // the client's own rules (forceteki-client validateDiscordUsername), for a request that skips the client
        const invalidNames: [string, string][] = [
            ['ab', 'Username must be at least 3 characters long.'],
            ['a'.repeat(33), 'Username cannot be more than 32 characters long.'],
            ['New Name', 'Username can only contain letters, numbers, underscores (_), and periods (.).'],
            [' NewName', 'Username can only contain letters, numbers, underscores (_), and periods (.).'],
            ['New-Name', 'Username can only contain letters, numbers, underscores (_), and periods (.).'],
            ['New..Name', 'Username cannot have two consecutive periods.'],
            ['.NewName', 'Username cannot start or end with a period or underscore.'],
            ['NewName_', 'Username cannot start or end with a period or underscore.'],
        ];
        for (const [newName, message] of invalidNames) {
            it(`refuses '${newName}' with the client's message, leaving the username as it was`, async function () {
                const { harness } = contextRef;
                const user = harness.createAccountClient(harness.db.seedAccount({ username: 'OldName' }));

                const response = await user.changeUsernameAsync(newName);

                expect(response.status).toBe(400);
                expect(response.body.message).toBe(message);
                expect(await usernameSeenByAsync(user)).toBe('OldName');
            });
        }

        it('refuses a username that is not a string, leaving the username as it was', async function () {
            const { harness } = contextRef;
            const user = harness.createAccountClient(harness.db.seedAccount({ username: 'OldName' }));

            // a body the real client never sends: it always sends a string
            const response = await user.requestAsync('post', '/api/change-username', { newUsername: { name: 'NewName' } });

            expect(response.status).toBe(400);
            expect(await usernameSeenByAsync(user)).toBe('OldName');
        });

        it('refuses a username containing profanity, leaving the username as it was', async function () {
            const { harness } = contextRef;
            const user = harness.createAccountClient(harness.db.seedAccount({ username: 'OldName' }));

            const response = await user.changeUsernameAsync('ShitHead');

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Username contains inappropriate words');
            expect(await usernameSeenByAsync(user)).toBe('OldName');
        });

        it('refuses a second change right after the first, since a change starts the 30-day cooldown', async function () {
            const { harness } = contextRef;
            const user = harness.createAccountClient(harness.db.seedAccount({ username: 'OldName' }));
            const first = await user.changeUsernameAsync('FirstName');
            expect(first.status).withContext('the first change')
                .toBe(200);

            const second = await user.changeUsernameAsync('SecondName');

            expect(second.status).toBe(403);
            expect(second.body.message).toContain('You can change your username again in 30 days');
            expect(await usernameSeenByAsync(user)).toBe('FirstName');
        });

        // seeded against the server's virtual clock: advancing it by weeks would run every hourly refresh on the way
        for (const { daysSinceLastChange, allowed } of [{ daysSinceLastChange: 29, allowed: false }, { daysSinceLastChange: 30, allowed: true }]) {
            it(`${allowed ? 'accepts' : 'refuses'} a change ${daysSinceLastChange} days after the last one`, async function () {
                const { harness } = contextRef;
                const usernameLastUpdatedAt = new Date(harness.clock.now() - daysSinceLastChange * MS_PER_DAY).toISOString();
                const user = harness.createAccountClient(harness.db.seedAccount({ username: 'OldName', profile: { usernameLastUpdatedAt } }));

                const response = await user.changeUsernameAsync('NewName');

                expect(response.status).toBe(allowed ? 200 : 403);
                expect(await usernameSeenByAsync(user)).toBe(allowed ? 'NewName' : 'OldName');
            });
        }
    });
});
