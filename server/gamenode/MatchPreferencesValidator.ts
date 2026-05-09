import { Aspect } from '../game/core/Constants';

import type { MatchPreferences } from './MatchmakingRules';

const ASPECTS = new Set<string>(Object.values(Aspect));

const MAX_ARCHETYPES = 200;
const MAX_ID_LENGTH = 64;

/**
 * Validates an arbitrary value as MatchPreferences. Returns null on success
 * or a short human-readable error string when validation fails. Caller is
 * expected to surface a 400 with the error string.
 */
export function validateMatchPreferencesInput(input: unknown): string | null {
    if (typeof input !== 'object' || input === null) {
        return 'matchPreferences must be an object';
    }
    const prefs = input as Record<string, unknown>;
    if (typeof prefs.enabled !== 'boolean') {
        return 'matchPreferences.enabled must be a boolean';
    }
    if (!Array.isArray(prefs.allowedArchetypes)) {
        return 'matchPreferences.allowedArchetypes must be an array';
    }
    if (prefs.allowedArchetypes.length > MAX_ARCHETYPES) {
        return `matchPreferences.allowedArchetypes must contain at most ${MAX_ARCHETYPES} entries`;
    }
    for (let i = 0; i < prefs.allowedArchetypes.length; i++) {
        const archetypeError = validateArchetype(prefs.allowedArchetypes[i], i);
        if (archetypeError) {
            return archetypeError;
        }
    }
    return null;
}

function validateArchetype(input: unknown, index: number): string | null {
    if (typeof input !== 'object' || input === null) {
        return `matchPreferences.allowedArchetypes[${index}] must be an object`;
    }
    const archetype = input as Record<string, unknown>;
    if (typeof archetype.leaderId !== 'string' || archetype.leaderId.length === 0) {
        return `matchPreferences.allowedArchetypes[${index}].leaderId must be a non-empty string`;
    }
    if (archetype.leaderId.length > MAX_ID_LENGTH) {
        return `matchPreferences.allowedArchetypes[${index}].leaderId must be at most ${MAX_ID_LENGTH} characters`;
    }
    if (archetype.baseConstraint === undefined || archetype.baseConstraint === null) {
        return null;
    }
    if (typeof archetype.baseConstraint !== 'object') {
        return `matchPreferences.allowedArchetypes[${index}].baseConstraint must be an object`;
    }
    const constraint = archetype.baseConstraint as Record<string, unknown>;
    if (constraint.kind === 'specificBase') {
        if (typeof constraint.baseId !== 'string' || constraint.baseId.length === 0) {
            return `matchPreferences.allowedArchetypes[${index}].baseConstraint.baseId must be a non-empty string`;
        }
        if (constraint.baseId.length > MAX_ID_LENGTH) {
            return `matchPreferences.allowedArchetypes[${index}].baseConstraint.baseId must be at most ${MAX_ID_LENGTH} characters`;
        }
        return null;
    }
    if (constraint.kind === 'aspect') {
        if (typeof constraint.aspect !== 'string' || !ASPECTS.has(constraint.aspect)) {
            return `matchPreferences.allowedArchetypes[${index}].baseConstraint.aspect must be one of: ${Object.values(Aspect).join(', ')}`;
        }
        return null;
    }
    return `matchPreferences.allowedArchetypes[${index}].baseConstraint.kind must be 'specificBase' or 'aspect'`;
}

/**
 * Narrows an already-validated input to the MatchPreferences type. Use only
 * after validateMatchPreferencesInput has returned null for the same value.
 */
export function asValidatedMatchPreferences(input: unknown): MatchPreferences {
    return input as MatchPreferences;
}
