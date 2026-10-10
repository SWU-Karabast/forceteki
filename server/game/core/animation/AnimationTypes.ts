import type { DamageType, ZoneName } from '../Constants';
import type { DefeatSourceType } from '../../IDamageOrDefeatSource';
import type { Player } from '../Player';

/**
 * The kinds of animation record the server emits. Each value is the discriminant of one
 * member of {@link AnimationRecord}.
 *
 * These name what HAPPENED in the game, never how to draw it. Durations, easing, stagger and
 * geometry are the client's business: it is the only side that knows where things are on
 * screen and what the viewer's motion preferences are. A previous attempt (PR #1948) shipped
 * `durationMs` and `priority` from here, which made every timing tweak a server deploy.
 */
export enum AnimationKind {
    Damage = 'damage',
    Defeat = 'defeat',
}

export interface IAnimationRecordBase {

    /** Absolute, monotonic index of this record in the log. Client orders by this. */
    seq: number;

    /**
     * Id of the resolution batch (one {@link EventWindow}) this record came from. Records
     * sharing a batch happened simultaneously as far as the rules are concerned. The server
     * never merges or reorders them — the client decides what to play together.
     *
     * Opaque: ids are allocated when a window is first seen, so a parent window can carry a
     * HIGHER id than its child. Order by {@link seq}, never by this.
     */
    batch: number;

    /**
     * Batch id of the enclosing window, when there is one.
     *
     * Needed because a unit's damage and the defeat it causes deliberately land in DIFFERENT
     * batches: `UnitProperties.addDamage` defers the defeat check to a post-event-resolution
     * callback, and `checkDefeated` routes the defeat through `game.addSubwindowEvents`, which
     * resolves in a fresh window. `parentBatch` is what lets the client tie the two together.
     */
    parentBatch?: number;

    kind: AnimationKind;
}

export interface IDamageAnimationRecord extends IAnimationRecordBase {
    kind: AnimationKind.Damage;

    /** uuid of the damaged card. */
    target: string;

    /** uuid of the card that dealt the damage, when one can be resolved. */
    source?: string;

    /** Damage actually applied, already capped at the target's remaining HP. */
    amount: number;

    /** The target's remaining HP immediately after this event resolved. */
    remainingHp: number;

    damageType: DamageType;

    /**
     * Whether this damage is expected to defeat the target. Lets the client hold a damage
     * animation open for the defeat that will arrive in a later batch.
     */
    isLethal: boolean;

    /** Only set on the ability damage path; absent for combat, overwhelm and excess damage. */
    isIndirect?: boolean;
}

export interface IDefeatAnimationRecord extends IAnimationRecordBase {
    kind: AnimationKind.Defeat;

    /** uuid of the defeated card. */
    card: string;

    /** Player id of the card's controller, taken from last known information. */
    controller?: string;

    /**
     * The arena the card was in before it left play, from last known information. By the time
     * this record is built the card has already moved to discard, so its live zone is useless.
     */
    arena?: ZoneName;

    reason: DefeatSourceType | 'unknown';

    /** uuid of the card responsible, when one can be resolved. */
    defeatedBy?: string;
}

export type AnimationRecord = IDamageAnimationRecord | IDefeatAnimationRecord;

/** A record with its batch already stamped, awaiting only its seq from the log. */
export type AnimationRecordPreSeq =
  | Omit<IDamageAnimationRecord, 'seq'>
  | Omit<IDefeatAnimationRecord, 'seq'>;

/** A record as a descriptor builds it, before the recorder stamps identity onto it. */
export type AnimationRecordDraft =
  | Omit<IDamageAnimationRecord, 'seq' | 'batch' | 'parentBatch'>
  | Omit<IDefeatAnimationRecord, 'seq' | 'batch' | 'parentBatch'>;

/**
 * One animation definition.
 *
 * Adding a new animation means adding one of these to the library — game systems keep emitting
 * the events they already emit and never learn that animations exist.
 */
export interface IAnimationDescriptor {

    /** Unique; used in error logs to name the descriptor that threw. */
    name: string;

    /**
     * The record kinds this descriptor can produce. Used to resolve the redactor for a record
     * at serialization time; a kind with no descriptor claiming it is withheld by default.
     */
    kinds: AnimationKind[];

    /**
     * Engine event name -> predicate deciding whether this descriptor cares about that event.
     * Modelled on `StateWatcher`'s `when` map.
     */
    when: Record<string, (event: any) => boolean>;

    /** Builds the record(s) for an event, or returns null to emit nothing. */
    build: (event: any) => AnimationRecordDraft | AnimationRecordDraft[] | null;

    /**
     * Per-recipient projection. Return null to withhold the record from this viewer entirely.
     *
     * Mandatory even when it is the identity function. That is the point: it forces "does this
     * leak hidden information?" to be answered for every record kind, rather than in one
     * central filter that is easy to forget to extend.
     */
    redact: (record: AnimationRecord, viewer: Player | null) => AnimationRecord | null;
}

/** The animation fields added to the per-player game state payload. */
export interface IAnimationStatePayload {
    newAnimations: AnimationRecord[];
    animationOffset: number;
    totalAnimations: number;

    /**
     * Bumped on every rollback. A client seeing a new epoch must cancel in-flight animations
     * and snap to the state in the same payload: records it already received describe things
     * that no longer happened, and they cannot be recalled.
     */
    animationEpoch: number;

    /**
     * True when the recipient's cursor fell behind the trimmed head and records were dropped.
     * The client must skip animating and snap to current state rather than play a partial run.
     */
    animationsTruncated: boolean;
}
