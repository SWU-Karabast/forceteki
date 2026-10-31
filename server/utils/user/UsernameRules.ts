const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 32;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const FREE_CHANGE_WINDOW_MS = 7 * MS_PER_DAY;
const CHANGE_COOLDOWN_MS = 30 * MS_PER_DAY;

/**
 * Server-side mirror of the client's username rules (forceteki-client `validateDiscordUsername`);
 * keep the two in sync, including the messages.
 * @returns an error message, or null when the username is acceptable
 */
export function validateUsernameFormat(username: string): string | null {
    if (typeof username !== 'string' || !username.trim()) {
        return 'Username cannot be empty.';
    }
    if (username.length < USERNAME_MIN_LENGTH) {
        return `Username must be at least ${USERNAME_MIN_LENGTH} characters long.`;
    }
    if (username.length > USERNAME_MAX_LENGTH) {
        return `Username cannot be more than ${USERNAME_MAX_LENGTH} characters long.`;
    }
    if (!(/^[a-zA-Z0-9_.]+$/).test(username)) {
        return 'Username can only contain letters, numbers, underscores (_), and periods (.).';
    }
    if (username.includes('..')) {
        return 'Username cannot have two consecutive periods.';
    }
    if ((/^[._]|[._]$/).test(username)) {
        return 'Username cannot start or end with a period or underscore.';
    }
    return null;
}

export type UsernameChangeEligibilityReason =
  | 'forcedRename'
  | 'usernameChangesBlocked'
  | 'firstWeek'
  | 'cooldownActive'
  | 'cooldownElapsed';

export interface IUsernameChangeEligibilityInput {
    createdAt: string;
    usernameLastUpdatedAt?: string;

    /** An active Rename mod action, or the legacy needsUsernameChange flag. */
    isForcedRename: boolean;
    usernameChangesBlocked: boolean;
    now?: number;
}

export interface IUsernameChangeEligibility {
    canChange: boolean;
    reason: UsernameChangeEligibilityReason;
    daysRemaining?: number;
    nextChangeAllowedAt?: string;
}

/**
 * Whether a player may change their own username. Precedence: forced rename, then blocked, then the
 * free first week, then the 30-day cooldown. A forced rename outranks the block so a player who must
 * rename can always comply.
 */
export function evaluateUsernameChangeEligibility(input: IUsernameChangeEligibilityInput): IUsernameChangeEligibility {
    const now = input.now ?? Date.now();

    if (input.isForcedRename) {
        return { canChange: true, reason: 'forcedRename' };
    }

    if (input.usernameChangesBlocked) {
        return { canChange: false, reason: 'usernameChangesBlocked' };
    }

    const createdAt = new Date(input.createdAt).getTime();
    if (now - createdAt < FREE_CHANGE_WINDOW_MS) {
        return { canChange: true, reason: 'firstWeek' };
    }

    // Never changed means the cooldown counts from account creation
    const lastChange = input.usernameLastUpdatedAt ? new Date(input.usernameLastUpdatedAt).getTime() : createdAt;
    const nextChangeAllowedAtMs = lastChange + CHANGE_COOLDOWN_MS;
    if (now < nextChangeAllowedAtMs) {
        return {
            canChange: false,
            reason: 'cooldownActive',
            daysRemaining: Math.ceil((nextChangeAllowedAtMs - now) / MS_PER_DAY),
            nextChangeAllowedAt: new Date(nextChangeAllowedAtMs).toISOString(),
        };
    }

    return { canChange: true, reason: 'cooldownElapsed' };
}
