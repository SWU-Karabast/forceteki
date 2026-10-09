import type { IExportedGameState, IGameHistory, IGameStateValidationError } from './GameStateFormatTypes';
import { ExportedGameStateSchema, GameHistorySchema, zodIssueToValidationError } from './GameStateFormatSchema';

/**
 * Validates an unknown value against the exported game-state schema.
 *
 * Returns an empty array if the value is structurally valid; otherwise returns
 * every validation error found (all issues are collected before returning, so
 * the caller sees the full picture at once).
 *
 * ## What this validates
 * - Object shape and unknown-key rejection (`.strict()`)
 * - Field types (strings, numbers, booleans, arrays)
 * - Card identifier format: each `CardId` must be a known token slug or a
 *   set-code string matching `<SET>_<NUMBER>[<SUFFIX>]`
 * - Cross-field constraints:
 *   - A leader with `deployed: false` cannot carry `damage` or `upgrades`
 *   - Both players cannot simultaneously hold `hasInitiative: true`
 *
 * ## What this does NOT validate
 * Semantic / runtime checks — e.g. verifying that a named card exists in a
 * player's loaded deck, or that an arena unit belongs to the correct arena —
 * are the responsibility of the import layer after a successful parse. Those
 * checks depend on runtime deck data and belong closer to the applier.
 */
export function validateGameState(input: unknown): IGameStateValidationError[] {
    const result = ExportedGameStateSchema.safeParse(input);
    if (result.success) {
        return [];
    }
    return result.error.issues.map(zodIssueToValidationError);
}

/**
 * Parses and validates an unknown value, returning the typed `IExportedGameState`
 * on success or `null` on failure.
 *
 * @param input   - The raw (e.g. `JSON.parse`'d) value to validate.
 * @param onError - Optional callback invoked with the full list of errors when
 *                  validation fails. Useful for logging or surfacing errors to
 *                  the caller without a separate `validateGameState` call.
 */
export function parseGameState(
    input: unknown,
    onError?: (errors: IGameStateValidationError[]) => void
): IExportedGameState | null {
    const result = ExportedGameStateSchema.safeParse(input);
    if (result.success) {
        return result.data as IExportedGameState;
    }
    const errors = result.error.issues.map(zodIssueToValidationError);
    onError?.(errors);
    return null;
}

/**
 * Validates an unknown value against the game-history schema.
 *
 * Returns an empty array if valid; otherwise returns every validation error
 * found (all issues collected before returning).
 */
export function validateGameHistory(input: unknown): IGameStateValidationError[] {
    const result = GameHistorySchema.safeParse(input);
    if (result.success) {
        return [];
    }
    return result.error.issues.map(zodIssueToValidationError);
}

/**
 * Parses and validates an unknown value as an `IGameHistory`, returning the
 * typed object on success or `null` on failure.
 *
 * @param input   - The raw (e.g. `JSON.parse`'d) value to validate.
 * @param onError - Optional callback invoked with the full error list on failure.
 */
export function parseGameHistory(
    input: unknown,
    onError?: (errors: IGameStateValidationError[]) => void
): IGameHistory | null {
    const result = GameHistorySchema.safeParse(input);
    if (result.success) {
        return result.data as IGameHistory;
    }
    const errors = result.error.issues.map(zodIssueToValidationError);
    onError?.(errors);
    return null;
}
