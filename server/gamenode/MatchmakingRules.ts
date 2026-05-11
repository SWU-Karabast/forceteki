import type { Aspect } from '../game/core/Constants';

import type { PreviousMatchEntry, QueuedPlayer } from './QueueHandler';

export interface IMatchmakingPlayerEntry {
    player: QueuedPlayer;
    previousMatch?: PreviousMatchEntry;

    /** Pre-resolved aspects of the player's base; consumed by leaderArchetypeFilter. */
    baseAspects?: readonly string[];
}

export interface IMatchmakingRule {
    canMatch(player1: IMatchmakingPlayerEntry, player2: IMatchmakingPlayerEntry): boolean;
}

export type BaseConstraint =
  | { kind: 'aspect'; aspect: Aspect }
  | { kind: 'baseType'; baseIds: string[] };

export interface OpponentArchetype {
    leaderId: string;
    baseConstraint?: BaseConstraint;

    /** Defaults to true; `false` keeps the archetype saved but excluded from the filter. */
    enabled?: boolean;
}

export interface MatchPreferences {
    enabled: boolean;
    allowedArchetypes: OpponentArchetype[];
}

export const MatchmakingRule = {
    rematchCooldown: (cooldownSeconds: number): IMatchmakingRule => {
        return new RematchCooldownRule(cooldownSeconds);
    },

    /** Both players must accept the other's leader+base via their match preferences. */
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
    if (archetype.leaderId !== opponentLeaderId) {
        return false;
    }
    const constraint = archetype.baseConstraint;
    if (!constraint) {
        return true;
    }
    switch (constraint.kind) {
        case 'baseType':
            return opponentBaseId !== undefined && constraint.baseIds.includes(opponentBaseId);
        case 'aspect':
            return opponentBaseAspects?.includes(constraint.aspect) ?? false;
    }
}
