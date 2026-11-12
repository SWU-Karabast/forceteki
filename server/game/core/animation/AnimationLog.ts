import type { AnimationRecord, AnimationRecordPreSeq, IAnimationStatePayload } from './AnimationTypes';
import type { Player } from '../Player';

/**
 * Append-only log of animation records with one read cursor per participant. Not part of the
 * game snapshot, so rollback does not restore it; see {@link resetForRollback}.
 */
export class AnimationLog {
    /** Maximum number of retained records. The oldest are dropped beyond this. */
    private static readonly MaxRecords = 512;

    private records: AnimationRecord[] = [];
    private readonly cursors = new Map<string, number>();

    /** seq of `records[0]`. */
    private baseIndex = 0;

    /** seq the next record will take. */
    private headIndex = 0;

    private epochCounter = 0;

    public get epoch(): number {
        return this.epochCounter;
    }

    /** seq the next record will take. */
    public get head(): number {
        return this.headIndex;
    }

    /** Retained records, oldest first. For tests and debugging. */
    public get retainedRecords(): readonly AnimationRecord[] {
        return this.records;
    }

    /** Appends a record and assigns its seq. */
    public append(record: AnimationRecordPreSeq): void {
        const stamped: AnimationRecord = { ...record, seq: this.headIndex };
        this.records.push(stamped);
        this.headIndex++;

        if (this.records.length > AnimationLog.MaxRecords) {
            const dropCount = this.records.length - AnimationLog.MaxRecords;
            this.records.splice(0, dropCount);
            this.baseIndex += dropCount;
        }
    }

    /**
     * Returns the records past this participant's cursor, each passed through `summarizeFor`, and
     * moves the cursor to the newest record. A participant without a cursor starts at the newest
     * record, so receives nothing older.
     */
    public readFor(
        participantId: string,
        viewer: Player | null,
        summarizeFor: (record: AnimationRecord, viewer: Player | null) => AnimationRecord | null
    ): IAnimationStatePayload {
        const cursor = this.cursors.get(participantId) ?? this.headIndex;
        const truncated = cursor < this.baseIndex;
        const start = Math.max(cursor, this.baseIndex);

        const newAnimations: AnimationRecord[] = [];
        for (let i = start - this.baseIndex; i < this.records.length; i++) {
            const summarized = summarizeFor(this.records[i], viewer);
            if (summarized != null) {
                newAnimations.push(summarized);
            }
        }

        this.cursors.set(participantId, this.headIndex);

        return {
            newAnimations,
            animationOffset: start,
            totalAnimations: this.headIndex,
            animationEpoch: this.epochCounter,
            animationsTruncated: truncated,
        };
    }

    /** This participant's current cursor, without advancing it or delivering anything. */
    public peekOffset(participantId: string): number {
        return this.cursors.get(participantId) ?? this.headIndex;
    }

    /** Moves this participant's cursor to the newest record without delivering anything. */
    public resyncParticipant(participantId: string): void {
        this.cursors.set(participantId, this.headIndex);
    }

    /**
     * Drops all retained records, moves every cursor to the newest record and increments the
     * epoch. seq numbering continues from where it was.
     */
    public resetForRollback(): void {
        this.records = [];
        this.baseIndex = this.headIndex;
        this.epochCounter++;
        for (const participantId of this.cursors.keys()) {
            this.cursors.set(participantId, this.headIndex);
        }
    }
}
