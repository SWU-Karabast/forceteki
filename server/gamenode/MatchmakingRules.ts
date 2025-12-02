import type { QueuedPlayer } from './QueueHandler';

export interface IMatchmakingRule {
    canMatch(player1: QueuedPlayer, player2: QueuedPlayer): boolean;
}

/**
 * Collection of predefined matchmaking rules
 */
export const MatchmakingRules = {
    /**
     * A matchmaking rule that prevents players from rematching
     * within a specified cooldown period.
     *
     * @param cooldownSeconds The cooldown period in seconds
     * @returns An instance of IMatchmakingRule enforcing the cooldown
     */
    rematchCooldown: (cooldownSeconds: number): IMatchmakingRule => {
        return new RematchCooldownRule(cooldownSeconds);
    },
};

class RematchCooldownRule implements IMatchmakingRule {
    private cooldownMs: number;

    public constructor(cooldownSeconds: number) {
        this.cooldownMs = cooldownSeconds * 1000;
    }

    public canMatch(player1: QueuedPlayer, player2: QueuedPlayer): boolean {
        const now = Date.now();

        const p1PreviousMatch = player1.previousMatch;
        const p2PreviousMatch = player2.previousMatch;

        if (
            p1PreviousMatch &&
            p1PreviousMatch.opponentUserId === player2.user.getId() &&
            this.isWithinCooldown(p1PreviousMatch.endTimestamp, now)
        ) {
            return false;
        }

        if (
            p2PreviousMatch &&
            p2PreviousMatch.opponentUserId === player1.user.getId() &&
            this.isWithinCooldown(p2PreviousMatch.endTimestamp, now)
        ) {
            return false;
        }

        return true;
    }

    private isWithinCooldown(endTimestamp: number, now: number): boolean {
        return now - endTimestamp <= this.cooldownMs;
    }
}
