import {
    evaluateUsernameChangeEligibility,
    validateUsernameFormat
} from '../../../../server/utils/user/UsernameRules';

describe('UsernameRules', function() {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const now = Date.UTC(2026, 9, 11);
    const daysAgo = (days: number): string => new Date(now - days * MS_PER_DAY).toISOString();

    describe('validateUsernameFormat', function() {
        // Parity with the client's validateDiscordUsername (forceteki-client/src/app/_validators/UsernameValidation)
        const validNames = ['abc', 'Karabast_User', 'KarabastUser', 'a.b', 'User.Name_1', 'a'.repeat(32)];
        for (const name of validNames) {
            it(`accepts '${name}'`, function() {
                expect(validateUsernameFormat(name)).toBeNull();
            });
        }

        const invalidNames: [string, string][] = [
            ['', 'Username cannot be empty.'],
            ['   ', 'Username cannot be empty.'],
            ['ab', 'Username must be at least 3 characters long.'],
            ['a'.repeat(33), 'Username cannot be more than 32 characters long.'],
            ['has space', 'Username can only contain letters, numbers, underscores (_), and periods (.).'],
            ['trailing ', 'Username can only contain letters, numbers, underscores (_), and periods (.).'],
            ['dash-name', 'Username can only contain letters, numbers, underscores (_), and periods (.).'],
            ['a..b', 'Username cannot have two consecutive periods.'],
            ['.abc', 'Username cannot start or end with a period or underscore.'],
            ['abc.', 'Username cannot start or end with a period or underscore.'],
            ['_abc', 'Username cannot start or end with a period or underscore.'],
            ['abc_', 'Username cannot start or end with a period or underscore.'],
        ];
        for (const [name, message] of invalidNames) {
            it(`rejects '${name}'`, function() {
                expect(validateUsernameFormat(name)).toBe(message);
            });
        }

        it('rejects non-string input', function() {
            expect(validateUsernameFormat(undefined as unknown as string)).toBe('Username cannot be empty.');
            expect(validateUsernameFormat({} as unknown as string)).toBe('Username cannot be empty.');
        });
    });

    describe('evaluateUsernameChangeEligibility', function() {
        const evaluate = (overrides: Partial<Parameters<typeof evaluateUsernameChangeEligibility>[0]> = {}) =>
            evaluateUsernameChangeEligibility({
                createdAt: daysAgo(100),
                usernameLastUpdatedAt: daysAgo(60),
                isForcedRename: false,
                usernameChangesBlocked: false,
                now,
                ...overrides,
            });

        it('lets a forced rename through even when username changes are blocked', function() {
            expect(evaluate({ isForcedRename: true, usernameChangesBlocked: true }).reason).toBe('forcedRename');
        });

        it('lets a forced rename through inside the cooldown', function() {
            const result = evaluate({ isForcedRename: true, usernameLastUpdatedAt: daysAgo(1) });

            expect(result.canChange).toBeTrue();
        });

        it('blocks ahead of the free first week', function() {
            const result = evaluate({ usernameChangesBlocked: true, createdAt: daysAgo(2), usernameLastUpdatedAt: undefined });

            expect(result).toEqual({ canChange: false, reason: 'usernameChangesBlocked' });
        });

        it('blocks ahead of an elapsed cooldown', function() {
            expect(evaluate({ usernameChangesBlocked: true }).canChange).toBeFalse();
        });

        it('allows changes freely inside the first week', function() {
            const result = evaluate({ createdAt: daysAgo(6), usernameLastUpdatedAt: daysAgo(1) });

            expect(result).toEqual({ canChange: true, reason: 'firstWeek' });
        });

        it('stops the free first week after 7 days', function() {
            const result = evaluate({ createdAt: daysAgo(8), usernameLastUpdatedAt: undefined });

            expect(result.reason).toBe('cooldownActive');
        });

        it('applies the 30-day cooldown after a voluntary change', function() {
            const result = evaluate({ usernameLastUpdatedAt: daysAgo(5) });

            expect(result.canChange).toBeFalse();
            expect(result.reason).toBe('cooldownActive');
            expect(result.daysRemaining).toBe(25);
            expect(result.nextChangeAllowedAt).toBe(new Date(now + 25 * MS_PER_DAY).toISOString());
        });

        it('counts the cooldown from account creation when the name was never changed', function() {
            const result = evaluate({ createdAt: daysAgo(10), usernameLastUpdatedAt: undefined });

            expect(result.daysRemaining).toBe(20);
        });

        it('allows a change once the cooldown has elapsed', function() {
            expect(evaluate({ usernameLastUpdatedAt: daysAgo(31) })).toEqual({ canChange: true, reason: 'cooldownElapsed' });
        });

        it('defaults the clock to the current time', function() {
            const result = evaluateUsernameChangeEligibility({
                createdAt: new Date().toISOString(),
                isForcedRename: false,
                usernameChangesBlocked: false,
            });

            expect(result.reason).toBe('firstWeek');
        });
    });
});
