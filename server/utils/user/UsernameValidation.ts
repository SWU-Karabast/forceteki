const MinUsernameLength = 3;
const MaxUsernameLength = 32;

/**
 * Checks a username against the rules the client enforces when a user picks a name
 * (forceteki-client `UserValidation.ts`), so a request that skips the client cannot store a name
 * that the client would have rejected. Keep both in sync.
 * @returns An error message for the user, or null if the username is valid
 */
export function getUsernameValidationError(username: string): string | null {
    if (!username.trim()) {
        return 'Username cannot be empty.';
    }
    if (username.length < MinUsernameLength) {
        return `Username must be at least ${MinUsernameLength} characters long.`;
    }
    if (username.length > MaxUsernameLength) {
        return `Username cannot be more than ${MaxUsernameLength} characters long.`;
    }
    if (!(/^[a-zA-Z0-9_.]+$/).test(username)) {
        return 'Username can only contain letters, numbers, underscores (_), and periods (.).';
    }
    if (username.includes('..')) {
        return 'Username cannot have two consecutive periods.';
    }
    if (username.startsWith('.') || username.endsWith('.') || username.startsWith('_') || username.endsWith('_')) {
        return 'Username cannot start or end with a period or underscore.';
    }
    return null;
}
