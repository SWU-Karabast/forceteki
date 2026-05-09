import type { Aspect } from '../game/core/Constants';

import type { PreviousMatchEntry, QueuedPlayer } from './QueueHandler';

export interface IMatchmakingPlayerEntry {
    player: QueuedPlayer;
    previousMatch?: PreviousMatchEntry;

    /**
     * Aspects of the player's base, pre-resolved from card data when the
     * player enters the queue. Used by leader/base filter rules.
     */
    baseAspects?: readonly string[];
}

export interface IMatchmakingRule {
    canMatch(player1: IMatchmakingPlayerEntry, player2: IMatchmakingPlayerEntry): boolean;
}

/**
 * Constraint on which bases a filtered opponent's deck can use, paired with a
 * leader. Omit `baseConstraint` for "any base of this leader".
 *
 * `baseType` carries the set of acceptable base-card ids inline. The FE
 * resolves a user-friendly category (e.g. "Aggression - Force", or a unique
 * base like "Colossus") to the list of card ids in that group, so the BE
 * doesn't need a separate base-type registry to evaluate the rule. `label`
 * is optional metadata for display only.
 */
export type BaseConstraint =
  | { kind: 'aspect'; aspect: Aspect }
  | { kind: 'baseType'; baseIds: string[]; label?: string };

/**
 * A single archetype the player is willing to be matched against.
 *
 * The wire format is forward-compatible: `baseConstraint` is optional, so a
 * v1 client that only exposes leader-only filters can omit it, while a future
 * client can add base-specificity without changing the wire shape.
 */
export interface OpponentArchetype {
    leaderId: string;
    baseConstraint?: BaseConstraint;

    /**
     * Set to `false` to keep the archetype saved but exclude it from the
     * active filter. Treated as `true` when omitted, so existing payloads
     * remain compatible.
     */
    enabled?: boolean;
}

/**
 * Opt-in matchmaking preferences. When `enabled` is false or
 * `allowedArchetypes` is empty, the rule treats the player as "match anyone"
 * (the default, current behavior).
 */
export interface MatchPreferences {
    enabled: boolean;
    allowedArchetypes: OpponentArchetype[];
}

/**
 * Collection of predefined matchmaking rules & values
 */
export const MatchmakingRule = {
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

    /**
     * A matchmaking rule that respects each player's opt-in opponent-archetype
     * filter. Both players must accept the other's leader+base for a match to
     * be allowed. Players without preferences (or with the filter disabled or
     * an empty allowlist) accept anyone, preserving the default behavior.
     */
    leaderArchetypeFilter: (): IMatchmakingRule => {
        return new LeaderArchetypeFilterRule();
    },
};

class RematchCooldownRule implements IMatchmakingRule {
    private cooldownMs: number;

    public constructor(cooldownSeconds: number) {
        this.cooldownMs = cooldownSeconds * 1000;
    }

    public canMatch(playerEntry1: IMatchmakingPlayerEntry, playerEntry2: IMatchmakingPlayerEntry): boolean {
        // disable the matching delay in local dev
        if (process.env.ENVIRONMENT === 'development') {
            return true;
        }

        const now = Date.now();

        const p1PreviousMatch = playerEntry1.previousMatch;
        const p2PreviousMatch = playerEntry2.previousMatch;
        if (
            p1PreviousMatch &&
            p1PreviousMatch.opponentUserId === playerEntry2.player.user.getId() &&
            this.isWithinCooldown(p1PreviousMatch.endTimestamp, now)
        ) {
            return false;
        }

        if (
            p2PreviousMatch &&
            p2PreviousMatch.opponentUserId === playerEntry1.player.user.getId() &&
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

class LeaderArchetypeFilterRule implements IMatchmakingRule {
    public canMatch(p1: IMatchmakingPlayerEntry, p2: IMatchmakingPlayerEntry): boolean {
        return playerAcceptsOpponent(p1, p2) && playerAcceptsOpponent(p2, p1);
    }
}

function playerAcceptsOpponent(filterer: IMatchmakingPlayerEntry, opponent: IMatchmakingPlayerEntry): boolean {
    const prefs = filterer.player.matchPreferences;
    if (!prefs || !prefs.enabled || prefs.allowedArchetypes.length === 0) {
        return true;
    }

    // Per-archetype `enabled` defaults to true; only false explicitly disables.
    const activeArchetypes = prefs.allowedArchetypes.filter((archetype) => archetype.enabled !== false);
    if (activeArchetypes.length === 0) {
        return true;
    }

    const opponentLeaderId = opponent.player.deck?.leader?.id;
    const opponentBaseId = opponent.player.deck?.base?.id;
    const opponentBaseAspects = opponent.baseAspects;

    return activeArchetypes.some((archetype) =>
        archetypeMatchesOpponent(archetype, opponentLeaderId, opponentBaseId, opponentBaseAspects)
    );
}

function archetypeMatchesOpponent(
    archetype: OpponentArchetype,
    opponentLeaderId: string | undefined,
    opponentBaseId: string | undefined,
    opponentBaseAspects: readonly string[] | undefined,
): boolean {
    if (!opponentLeaderId) {
        return false;
    }
    if (archetype.leaderId !== opponentLeaderId) {
        return false;
    }
    if (!archetype.baseConstraint) {
        return true;
    }
    if (archetype.baseConstraint.kind === 'baseType') {
        return typeof opponentBaseId === 'string' && archetype.baseConstraint.baseIds.includes(opponentBaseId);
    }
    if (archetype.baseConstraint.kind === 'aspect') {
        return Array.isArray(opponentBaseAspects) && opponentBaseAspects.includes(archetype.baseConstraint.aspect);
    }
    return false;
}
