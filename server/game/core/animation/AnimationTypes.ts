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
     * Records sharing a batch came from the same engine resolution step and happened
     * simultaneously as far as the rules are concerned. Batches are consecutive runs of the log:
     * ids only increase along it, and a batch is never interrupted by another. The server never
     * merges or reorders records — the client decides how to pace one batch against the next.
     */
    batch: number;

    kind: AnimationKind;
}

export interface IDamageAnimationRecord extends IAnimationRecordBase {
    kind: AnimationKind.Damage;

    /** uuid of the damaged card. */
    target: string;

    /**
     * uuids of the cards that dealt the damage. Usually one; several when an attack targets more
     * than one unit, because the engine resolves all defenders' return damage as one event with
     * one combined `amount`. Empty when no source card can be resolved.
     */
    sources: string[];

    /** Damage actually applied, already capped at the target's remaining HP. */
    amount: number;
}

export interface IDefeatAnimationRecord extends IAnimationRecordBase {
    kind: AnimationKind.Defeat;

    /** uuid of the defeated card. */
    card: string;
}

export type AnimationRecord = IDamageAnimationRecord | IDefeatAnimationRecord;

/** A record with its batch already stamped, awaiting only its seq from the log. */
export type AnimationRecordPreSeq =
  | Omit<IDamageAnimationRecord, 'seq'>
  | Omit<IDefeatAnimationRecord, 'seq'>;

/** A record as a descriptor builds it, before the recorder stamps identity onto it. */
export type AnimationRecordDraft =
  | Omit<IDamageAnimationRecord, 'seq' | 'batch'>
  | Omit<IDefeatAnimationRecord, 'seq' | 'batch'>;

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
     * The record kinds this descriptor can produce. Used to resolve the summarize for a record
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
     * The record as this viewer should see it. Return null to withhold it from this viewer
     * entirely.
     *
     * Mandatory even when it is the identity function. That is the point: it forces "does this
     * leak hidden information?" to be answered for every record kind, rather than in one
     * central filter that is easy to forget to extend.
     */
    summarizeFor: (record: AnimationRecord, viewer: Player | null) => AnimationRecord | null;
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
