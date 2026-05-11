import type { Aspect } from '../game/core/Constants';

export type BaseConstraint =
  | { kind: 'aspect'; aspect: Aspect }
  | { kind: 'baseType'; baseIds: string[] };

export interface OpponentArchetype {
    leaderId: string;
    baseConstraint?: BaseConstraint;

    /** Defaults to true; `false` keeps the archetype saved but excluded from the filter. */
    enabled?: boolean;
}

/**
 * Lobby-side check: does the joiner's deck satisfy any of the host's allowed
 * archetypes? Disabled archetypes are skipped; an empty active list returns
 * false (fail-closed — opposite of the queue-side filter behavior).
 */
export function deckMatchesArchetypeFilter(
    filter: readonly OpponentArchetype[],
    deckLeaderId: string | undefined,
    deckBaseId: string | undefined,
    deckBaseAspects: readonly Aspect[] | undefined,
): boolean {
    const active = filter.filter((a) => a.enabled !== false);
    return active.some((a) => archetypeMatchesOpponent(a, deckLeaderId, deckBaseId, deckBaseAspects));
}

export function archetypeMatchesOpponent(
    archetype: OpponentArchetype,
    opponentLeaderId: string | undefined,
    opponentBaseId: string | undefined,
    opponentBaseAspects: readonly Aspect[] | undefined,
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
