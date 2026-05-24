/**
 * Types for the SWU portable game-state format.
 *
 * This format serves two purposes:
 *   - **Export** — capturing a live game position as a JSON document that can
 *     be stored, shared, or replayed.
 *   - **Import** — re-applying a saved position to a fresh game (validated
 *     before apply; see `GameStateFormatValidator`).
 *
 */

// ── Card identifiers ──────────────────────────────────────────────────────────

/**
 * A set-code string identifying a specific printing of a card.
 * Format: `<SET>_<NUMBER>[<SUFFIX>]`
 *   - SET: 2–5 uppercase alphanumeric characters (e.g. `SOR`, `JTL`, `ASH`)
 *   - NUMBER: one or more digits, typically zero-padded to three places
 *   - SUFFIX: optional lowercase letter for variant printings (e.g. `b`)
 *
 * Examples: `"SOR_001"`, `"JTL_042b"`, `"ASH_209"`
 */
export type SetCodeId = string;

/**
 * InternalName slugs for token cards. Tokens are generated during play and
 * have no set code — they are always identified by these fixed names.
 */
export const TOKEN_NAMES = [
    // Upgrade tokens
    'shield',
    'experience',
    'advantage',
    // Unit tokens
    'clone-trooper',
    'battle-droid',
    'tie-fighter',
    'xwing',
    'mandalorian',
    'spy',
    // Other
    'the-force',
    'credit',
] as const;

export type TokenName = (typeof TOKEN_NAMES)[number];

/**
 * Any card identifier: a set-code string for deck cards, or a token slug for
 * generated tokens. The Zod schema (`GameStateFormatSchema`) validates that
 * strings conform to one of these two patterns.
 */
export type CardId = SetCodeId | TokenName;

// ── Upgrade state ─────────────────────────────────────────────────────────────

export interface IExportedUpgradeState {
    card: CardId;

    /**
     * Player number (1 or 2) of the upgrade's owner — present only when the
     * upgrade's owner and controller differ (e.g. one player's upgrade attached
     * to the other player's unit).
     */
    owner?: 1 | 2;

    /**
     * Player number (1 or 2) of the upgrade's controller — present only when
     * the upgrade's owner and controller differ.
     */
    controller?: 1 | 2;
}

/** An upgrade entry: either a bare `CardId` or a full upgrade state object. */
export type UpgradeEntry = CardId | IExportedUpgradeState;

// ── Captured units ────────────────────────────────────────────────────────────

export interface IExportedCapturedCardState {
    card: CardId;

    /** Player number (1 or 2) of the captured unit's original owner. */
    owner: 1 | 2;
}

/** A captured-unit entry: bare `CardId` or full captured state object. */
export type CapturedEntry = CardId | IExportedCapturedCardState;

// ── In-play card state ────────────────────────────────────────────────────────

export interface IExportedCardState {
    card: CardId;
    damage?: number;
    exhausted?: boolean;
    upgrades?: UpgradeEntry[];
    capturedUnits?: CapturedEntry[];

    /**
     * Player number (1 or 2) of the card's owner — present only when the
     * card's controller differs from its owner (e.g. after a control-switch
     * effect).
     */
    owner?: 1 | 2;
}

/** An arena or hand card entry: bare `CardId` or full card state object. */
export type CardEntry = CardId | IExportedCardState;

// ── Leader state ──────────────────────────────────────────────────────────────

export interface IExportedLeaderState {
    card: CardId;
    deployed?: boolean;
    damage?: number;
    exhausted?: boolean;
    upgrades?: UpgradeEntry[];
    capturedUnits?: CapturedEntry[];

    /** True when the leader's non-leader side is face-up (flip ability, ex: TWI Palp). */
    flipped?: boolean;

    /**
     * True once the leader's deploy epic action has been used, even if the
     * leader has subsequently been returned to the non-deployed zone.
     * Omitted (falsy) when the epic action has not yet been used.
     */
    epicActionSpent?: boolean;
}

// ── Base state ────────────────────────────────────────────────────────────────

export interface IExportedBaseState {
    card: CardId;
    damage?: number;

    /**
     * True once the base's epic action has been used.
     * Omitted (falsy) when the epic action has not yet been used.
     */
    epicActionSpent?: boolean;
}

// ── Resource entries ──────────────────────────────────────────────────────────

export interface IExportedResourceState {
    card: CardId;
    exhausted?: boolean;
}

/** A resource entry: bare `CardId` (ready) or a full resource state object. */
export type ResourceEntry = CardId | IExportedResourceState;

// ── Player state ──────────────────────────────────────────────────────────────

export interface IExportedPlayerState {
    hand?: CardId[];
    groundArena?: CardEntry[];
    spaceArena?: CardEntry[];
    discard?: CardId[];
    deck?: CardId[];
    resources?: ResourceEntry[];
    base: CardId | IExportedBaseState;
    leader: CardId | IExportedLeaderState;
    hasInitiative?: boolean;
    hasForceToken?: boolean;
    credits?: number;
}

// ── Top-level game state ──────────────────────────────────────────────────────

export type PhaseName = 'setup' | 'action' | 'regroup';

export interface IExportedGameState {
    phase?: PhaseName;

    /**
     * The current round number (1-based). Present in history entries; omitted
     * when the state is used as a standalone resume-game payload.
     */
    round?: number;

    /**
     * The ordinal of the action within the current round (1-based). Increments
     * once per resolved player action. Present in history entries only.
     */
    actionNumber?: number;

    /** Lobby owner's state. */
    player1: IExportedPlayerState;

    /** Opponent's state. */
    player2: IExportedPlayerState;
}

// ── Game history ──────────────────────────────────────────────────────────────

/**
 * All discrete action types that generate a top-level message in the game
 * chat log. The list mirrors the chat-log vocabulary exactly so that a
 * replayer can reconstruct the same log entry from an `IActionSummary` alone.
 *
 * Player-initiated actions (always carry `actingPlayer`):
 *   playCard        — "{player} plays {card} [attaching it to {target}]"
 *   attack          — "{player} attacks {target} with {card}"
 *   useAbility      — "{player} uses {card}'s ability"
 *   pass            — "{player} passes"
 *   claimInitiative — "{player} claims initiative and passes"
 *   resource        — "{player} has resourced {card} from hand"
 *                     (sourceCard absent when the player declined to resource:
 *                      "{player} has not resourced any cards")
 *   mulligan        — "{player} will mulligan"
 *   keepHand        — "{player} will keep their hand"
 *   concede         — "{player} concedes the game"
 *
 * Engine-driven transitions (no `actingPlayer`):
 *   phaseStart      — "Round: {round} – {phase} Phase"
 */
export type ActionType =
    | 'playCard'
    | 'attack'
    | 'useAbility'
    | 'pass'
    | 'claimInitiative'
    | 'resource'
    | 'mulligan'
    | 'keepHand'
    | 'concede'
    | 'phaseStart';

export interface IActionSummary {
    type: ActionType;

    /**
     * The player who took the action (1 = lobby owner, 2 = opponent).
     * Absent for engine-driven transitions (`type: 'phaseStart'`).
     */
    actingPlayer?: 1 | 2;

    /**
     * The primary card involved in the action:
     * - `playCard`    — the card played from hand
     * - `attack`      — the attacking unit
     * - `useAbility`  — the card whose ability was activated
     * - `resource`    — the card resourced (absent when player declined to resource)
     */
    sourceCard?: CardId;

    /**
     * The primary target of the action:
     * - `playCard` (upgrade / pilot) — the unit the card attached to
     * - `attack`                     — the defending unit or base
     * - `useAbility`                 — the primary target, if any
     */
    targetCard?: CardId;
}

export interface IGameHistoryAction {
    /** Monotonically increasing sequence number across the whole game (1-based). */
    seq: number;

    /** Game round this action occurred in (1-based). */
    round: number;

    /** What happened. Absent for the synthetic seq-1 initial-state entry. */
    action?: IActionSummary;

    /** Full board state *after* this action resolved. */
    state: IExportedGameState;
}

export type GameEndReason = 'baseDestroyed' | 'concede' | 'timeout';

export interface IGameResult {
    winner: 1 | 2;
    reason: GameEndReason;
}

export interface IGameHistory {
    /** Ordered list of action entries. Entry at index 0 is the post-setup
     *  initial state (seq 1, no `action` field). */
    entries: IGameHistoryAction[];

    /** Populated once the game ends. */
    result?: IGameResult;
}

// ── Validation ────────────────────────────────────────────────────────────────

export interface IGameStateValidationError {

    /**
     * Dot/bracket path into the JSON document pointing to the offending value,
     * e.g. `"player1.groundArena[2].card"`. Empty string means the top-level
     * object itself is invalid.
     */
    path: string;
    message: string;
}
