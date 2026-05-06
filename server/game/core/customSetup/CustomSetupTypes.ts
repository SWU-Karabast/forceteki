/**
 * Types describing a custom starting board state that a private-lobby owner
 * can define to override the default game-start (mulligan + resource-2) flow.
 *
 * The shape mirrors the test fixtures in `forceteki/test/gameSetups/*.json`,
 * but with these production-only constraints:
 *   - All named cards must already exist in the corresponding player's
 *     uploaded deck (we do not synthesize decks).
 *   - Leader/base identity always comes from each player's loaded deck — the
 *     JSON's leader/base fields only describe state (deployed, damage, etc).
 *     A `card` field is allowed for self-documentation but must match.
 *   - Only the 'action' phase is supported as a starting point.
 *
 * `player1` is the lobby owner; `player2` is the opponent.
 */

export type CardEntry = string | ICardSpec;

export interface ICardSpec {
    card: string;
    damage?: number;
    exhausted?: boolean;
    upgrades?: CardEntry[];
}

export interface ILeaderSpec {

    /** Optional self-documentation; if present, must match the player's deck leader. */
    card?: string;
    deployed?: boolean;
    damage?: number;
    exhausted?: boolean;
    upgrades?: CardEntry[];
    flipped?: boolean;
}

export interface IBaseSpec {

    /** Optional self-documentation; if present, must match the player's deck base. */
    card?: string;
    damage?: number;
}

export interface IResourceSpec {
    card: string;
    exhausted?: boolean;
}

export type ResourceEntry = string | IResourceSpec;

export interface ICustomSetupPlayerState {
    hand?: string[];
    groundArena?: CardEntry[];
    spaceArena?: CardEntry[];
    discard?: string[];

    /**
     * Cards (by internalName) to leave on top of the deck. Cards not listed are
     * removed from play. If omitted, the entire remaining deck is left intact.
     */
    deck?: string[];

    /** Either a count of generic resources or an explicit list of cards from the deck. */
    resources?: number | ResourceEntry[];
    base?: string | IBaseSpec;
    leader?: string | ILeaderSpec;
    hasInitiative?: boolean;
    hasForceToken?: boolean;
    credits?: number;
}

export interface ICustomSetupState {

    /** Only 'action' is supported for now. */
    phase?: 'action';
    player1: ICustomSetupPlayerState;
    player2: ICustomSetupPlayerState;
}

export interface ICustomSetupValidationError {

    /** Dot/bracket path into the JSON document, e.g. "player1.hand[2]". */
    path: string;
    message: string;
}

export class CustomSetupValidationFailure extends Error {
    public constructor(public readonly errors: ICustomSetupValidationError[]) {
        super(`Custom setup validation failed with ${errors.length} error(s)`);
        this.name = 'CustomSetupValidationFailure';
    }
}

const TOKEN_UPGRADE_NAMES = new Set(['shield', 'experience', 'advantage']);

export function isTokenUpgradeName(name: string): boolean {
    return TOKEN_UPGRADE_NAMES.has(name);
}

const ALLOWED_PLAYER_KEYS = new Set([
    'hand',
    'groundArena',
    'spaceArena',
    'discard',
    'deck',
    'resources',
    'base',
    'leader',
    'hasInitiative',
    'hasForceToken',
    'credits',
]);

const ALLOWED_TOP_LEVEL_KEYS = new Set(['phase', 'player1', 'player2']);

export function getAllowedPlayerKeys(): ReadonlySet<string> {
    return ALLOWED_PLAYER_KEYS;
}

export function getAllowedTopLevelKeys(): ReadonlySet<string> {
    return ALLOWED_TOP_LEVEL_KEYS;
}
