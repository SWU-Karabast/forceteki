import type { AnimationRecord, AnimationRecordPreSeq, IAnimationStatePayload } from './AnimationTypes';
import type { Player } from '../Player';

/**
 * Append-only log of animation records plus one read cursor per participant.
 *
 * Deliberately a plain class rather than a `GameObjectBase`, so it is NOT part of the snapshot
 * state and does not roll back — the same treatment `gameChat` and `chatMessageOffsets` get.
 * Rollback clears it outright (see {@link resetForRollback}) because replaying animations for
 * events that were undone is never what anyone wants.
 *
 * The per-participant cursor is the whole point of this class. `Game.getState` is called once
 * per recipient, so any design that clears a shared queue after serializing hands the records
 * to whoever is served first and an empty list to everyone else — the exact bug that sank
 * PR #782. A cursor makes "both players receive every record" structural instead of something
 * each call site has to remember.
 */
export class AnimationLog {
    /**
     * Hard cap on retained records. A disconnected player's cursor never advances (Lobby only
     * serializes for connected sockets), so a min-cursor trim could be pinned forever; this
     * bound is what actually keeps memory finite. A full game produces a few hundred records,
     * so in practice this never fires.
     */
    private static readonly MaxRecords = 512;

    private records: AnimationRecord[] = [];
    private readonly cursors = new Map<string, number>();

    /** Absolute index of `records[0]`. Only advances when the cap forces a trim. */
    private baseIndex = 0;

    /** Absolute index one past the newest record. Monotonic for the whole game, even across rollbacks. */
    private headIndex = 0;

    private epochCounter = 0;

    public get epoch(): number {
        return this.epochCounter;
    }

    /** Absolute index one past the newest record; also the seq the next record will take. */
    public get head(): number {
        return this.headIndex;
    }

    /** Live view of retained records. For tests and debugging only. */
    public get retainedRecords(): readonly AnimationRecord[] {
        return this.records;
    }

    /** Appends a record, stamping it with its absolute seq. */
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
     * Builds the animation payload for one participant and advances their cursor.
     *
     * A participant with no cursor yet starts at the CURRENT HEAD, not at zero — the opposite
     * of `chatMessageOffsets`' `?? 0`. A spectator joining mid-game wants the chat backlog but
     * emphatically does not want to watch every animation of the game so far replay at once.
     */
    public readFor(
        participantId: string,
        viewer: Player | null,
        redact: (record: AnimationRecord, viewer: Player | null) => AnimationRecord | null
    ): IAnimationStatePayload {
        const cursor = this.cursors.get(participantId) ?? this.headIndex;
        const truncated = cursor < this.baseIndex;
        const start = Math.max(cursor, this.baseIndex);

        const newAnimations: AnimationRecord[] = [];
        for (const record of this.records.slice(start - this.baseIndex)) {
            const projected = redact(record, viewer);
            if (projected != null) {
                // Shallow copy so the payload never aliases the stored record. `Game.getState`
                // finishes with `convertNullToUndefinedRecursiveInPlace`, which mutates whatever
                // it can reach — without the copy that would rewrite the log itself, once per
                // recipient.
                newAnimations.push({ ...projected });
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

    /**
     * Fast-forwards a participant to the head without delivering anything.
     *
     * Called when someone (re)joins. A player who was disconnected for several turns has a
     * stale cursor — `Lobby.sendGameState` skips disconnected sockets, so it never advanced —
     * and without this they would reconnect into a burst of every animation they missed.
     */
    public resyncParticipant(participantId: string): void {
        this.cursors.set(participantId, this.headIndex);
    }

    /**
     * Drops every pending record and bumps the epoch. Called on rollback.
     *
     * Clearing only cancels records that have not shipped yet. Anything already delivered is
     * on the client and cannot be recalled, which is what `animationEpoch` is for: seeing a new
     * epoch tells the client to cancel in-flight animations and snap to the state it was sent
     * alongside. Seq numbering continues rather than restarting, so a record id is never reused.
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
