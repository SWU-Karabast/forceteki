/**
 * Enum defining all available animation types in the game.
 * Animations are processed sequentially on the client with priorities determining execution order.
 */
export enum AnimationType {
    // Damage and healing
    Damage = 'DAMAGE',
    Heal = 'HEAL',

    // Card state changes
    Exhaust = 'EXHAUST',
    Ready = 'READY',
    Defeat = 'DEFEAT',

    // Card movements
    Play = 'PLAY',
    Draw = 'DRAW',
    Discard = 'DISCARD',
    Return = 'RETURN',
    Move = 'MOVE',

    // Deck operations
    Shuffle = 'SHUFFLE',
    Reveal = 'REVEAL',

    // Resource and tokens
    GainResource = 'GAIN_RESOURCE',
    SpendResource = 'SPEND_RESOURCE',
    // GainShield = 'GAIN_SHIELD', // Not yet implemented - reserved for future use
    LoseShield = 'LOSE_SHIELD',
    GainExperience = 'GAIN_EXPERIENCE',

    // Combat
    Attack = 'ATTACK',

    // Visual effects
    Highlight = 'HIGHLIGHT',
}

/**
 * Core animation event structure sent from server to client.
 * Each event represents a single visual animation to be executed.
 */
export interface AnimationEvent {

    /** Type of animation to execute */
    type: AnimationType;

    /** UUID of the card or 'P1BASE'/'P2BASE' for bases */
    targetId: string;

    /** Duration of the animation in milliseconds */
    durationMs: number;

    /** Priority for execution order (higher = earlier, default: 50) */
    priority: number;

    /** Optional source card UUID (e.g., attacker, ability source) */
    sourceId?: string;

    /** Optional numeric value (e.g., damage amount, heal amount) */
    value?: number;

    /** Type-specific additional data */
    metadata?: Record<string, unknown>;
}

/**
 * Container for a batch of animation events sent to the client.
 * Events are typically grouped by game action/resolution.
 */
export interface AnimationQueue {

    /** Array of animation events to execute */
    events: AnimationEvent[];

    /** Timestamp when the queue was created */
    timestamp: number;

    /** Unique identifier for this batch of animations */
    sequenceId: string;
}

/**
 * Metadata for REVEAL animations
 */
export interface RevealMetadata {
    cardId: string;
    cardName?: string;
    faceUp: boolean;
}

/**
 * Metadata for MOVE animations
 */
export interface MoveMetadata {
    fromZone: string;
    toZone: string;
    cardType?: string;
    toPosition?: { x: number; y: number };
}

/**
 * Metadata for ATTACK animations
 */
export interface AttackMetadata {
    defenderId: string;
    damageDealt?: number;
}

/**
 * Metadata for simultaneous damage animations
 */
export interface SimultaneousDamageMetadata {

    /** Indicates this damage is part of a simultaneous group */
    isSimultaneous: boolean;

    /** Groups simultaneous animations together */
    groupId?: string;
}
