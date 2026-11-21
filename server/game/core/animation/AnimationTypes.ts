import type { Player } from '../Player';

/** The kinds of animation record. Each value is the discriminant of one {@link AnimationRecord} member. */
export enum AnimationKind {
    Damage = 'damage',
    Defeat = 'defeat',
}

export interface IAnimationRecordBase {

    /** Position of this record in the log. Increases by one per record and is never reused. */
    seq: number;

    /**
     * Records that resolved together share a batch. Batch ids only increase along the log, and a
     * batch is never split by another one.
     */
    batch: number;

    kind: AnimationKind;
}

export interface IDamageAnimationRecord extends IAnimationRecordBase {
    kind: AnimationKind.Damage;

    /** uuid of the damaged card. */
    cardId: string;

    /** uuids of the cards that dealt the damage. Empty when no source card can be resolved. */
    sourceCardIds: string[];

    /** Damage actually applied to the card. */
    amount: number;
}

export interface IDefeatAnimationRecord extends IAnimationRecordBase {
    kind: AnimationKind.Defeat;

    /** uuid of the defeated card. */
    cardId: string;
}

export type AnimationRecord = IDamageAnimationRecord | IDefeatAnimationRecord;

/** A record with its batch set, before the log assigns its seq. */
export type AnimationRecordPreSeq =
  | Omit<IDamageAnimationRecord, 'seq'>
  | Omit<IDefeatAnimationRecord, 'seq'>;

/** A record as a descriptor builds it, before the recorder sets its batch and seq. */
export type AnimationRecordDraft =
  | Omit<IDamageAnimationRecord, 'seq' | 'batch'>
  | Omit<IDefeatAnimationRecord, 'seq' | 'batch'>;

/** Turns engine events into animation records. */
export interface IAnimationDescriptor {

    /** Unique name, used in error logs. */
    name: string;

    /** The record kinds this descriptor produces. */
    kinds: AnimationKind[];

    /** Engine event name -> whether this descriptor handles that event. */
    when: Record<string, (event: any) => boolean>;

    /** Builds the record(s) for an event, or returns null to record nothing. */
    build: (event: any) => AnimationRecordDraft | AnimationRecordDraft[] | null;

    /** Returns the record as the given viewer should receive it, or null to withhold it. */
    summarizeFor: (record: AnimationRecord, viewer: Player | null) => AnimationRecord | null;
}

/** The animation fields added to a participant's game state. */
export interface IAnimationStatePayload {

    /** Records added since this participant's last read. */
    newAnimations: AnimationRecord[];

    /** seq of the first record in `newAnimations`. */
    animationOffset: number;

    /** seq the next record will take. */
    totalAnimations: number;

    /** Increases by one on every rollback. */
    animationEpoch: number;

    /** True when records this participant had not read were dropped from the log. */
    animationsTruncated: boolean;
}
