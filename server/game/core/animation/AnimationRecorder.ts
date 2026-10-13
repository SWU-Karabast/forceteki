import type { Game } from '../Game';
import type { Player } from '../Player';
import type { EventWindow } from '../event/EventWindow';
import { logger } from '../../../logger';
import { AnimationLog } from './AnimationLog';
import type {
    AnimationKind,
    AnimationRecord,
    AnimationRecordDraft,
    AnimationRecordPreSeq,
    IAnimationDescriptor,
    IAnimationStatePayload,
} from './AnimationTypes';

/**
 * Subscribes the registered animation descriptors to the engine's event emitter and turns the
 * events they care about into animation records.
 *
 * Game systems know nothing about this. They emit the `EventName.*` events they already emit;
 * everything animation-specific lives in the descriptor library. That is the difference from
 * PR #1948, which needed matching edits inside `DamageSystem`, `HealSystem`, `DefeatCardSystem`
 * and `AttachUpgradeSystem` for its four animations.
 */
export class AnimationRecorder {
    private static readonly MaxLoggedErrorsPerDescriptor = 5;

    private readonly log = new AnimationLog();
    private readonly descriptors: IAnimationDescriptor[];
    private readonly summarizersByKind = new Map<AnimationKind, IAnimationDescriptor['summarizeFor']>();
    private readonly errorCounts = new Map<string, number>();

    /**
     * The window the previous record came from, compared by identity to decide whether the next
     * record starts a new batch. Safe to hold because `EventWindow` extends `BaseStep` — a plain
     * class, not a `GameObjectBase` — so it is never snapshotted or restored.
     */
    private lastWindow: EventWindow | null = null;
    private batchId = 0;

    public constructor(
        private readonly game: Game,
        descriptors: IAnimationDescriptor[]
    ) {
        this.descriptors = descriptors;
        this.indexSummarizers();
        this.registerListeners();
    }

    public get epoch(): number {
        return this.log.epoch;
    }

    /** Retained records, newest last. For tests and debugging. */
    public get records(): readonly AnimationRecord[] {
        return this.log.retainedRecords;
    }

    /** Builds one participant's animation payload and advances their cursor. */
    public readFor(participantId: string, viewer: Player | null): IAnimationStatePayload {
        return this.log.readFor(participantId, viewer, (record, forViewer) => this.summarizeFor(record, forViewer));
    }

    /** This participant's current cursor, without advancing it. */
    public peekOffset(participantId: string): number {
        return this.log.peekOffset(participantId);
    }

    public resyncParticipant(participantId: string): void {
        this.log.resyncParticipant(participantId);
    }

    public resetForRollback(): void {
        this.log.resetForRollback();
    }

    /**
     * One summarizer per record kind, resolved at construction so a missing or ambiguous one is a
     * startup failure rather than a silent information leak at serialization time.
     */
    private indexSummarizers(): void {
        for (const descriptor of this.descriptors) {
            for (const kind of descriptor.kinds) {
                const existing = this.summarizersByKind.get(kind);
                if (existing != null && existing !== descriptor.summarizeFor) {
                    throw new Error(
                        `Animation kind "${kind}" is claimed by more than one descriptor with differing summarizeFor functions (offender: "${descriptor.name}")`
                    );
                }
                this.summarizersByKind.set(kind, descriptor.summarizeFor);
            }
        }
    }

    private registerListeners(): void {
        const eventNames = new Set<string>();
        for (const descriptor of this.descriptors) {
            for (const eventName of Object.keys(descriptor.when)) {
                eventNames.add(eventName);
            }
        }

        for (const eventName of eventNames) {
            this.game.on(eventName, (event: any) => this.handleEvent(eventName, event));
        }
    }

    private handleEvent(eventName: string, event: any): void {
        for (const descriptor of this.descriptors) {
            const predicate = descriptor.when[eventName];
            if (predicate == null) {
                continue;
            }

            // Every descriptor call is isolated: an animation is cosmetic, and a bug in one must
            // never propagate into the rules engine and break the game for both players.
            try {
                if (!predicate(event)) {
                    continue;
                }

                const built = descriptor.build(event);
                if (built == null) {
                    continue;
                }

                const drafts = Array.isArray(built) ? built : [built];
                const batch = this.currentBatch();
                for (const draft of drafts) {
                    this.appendDraft(draft, batch);
                }
            } catch (error) {
                this.logError(descriptor.name, eventName, error);
            }
        }
    }

    private appendDraft(draft: AnimationRecordDraft, batch: number): void {
        const stamped: AnimationRecordPreSeq = { ...draft, batch };
        this.log.append(stamped);
    }

    /**
     * The batch for a record about to be appended. A batch is a run of consecutive records from
     * the same event window, so batch ids only ever increase along the log and a batch is never
     * split by another one. Records emitted outside any window (e.g. `Game.emitEvent`) each get a
     * batch of their own.
     */
    private currentBatch(): number {
        const window = this.game.currentEventWindow;
        if (window == null || window !== this.lastWindow) {
            this.batchId++;
        }
        this.lastWindow = window;
        return this.batchId;
    }

    private summarizeFor(record: AnimationRecord, viewer: Player | null): AnimationRecord | null {
        const summarize = this.summarizersByKind.get(record.kind);
        if (summarize == null) {
            // Default deny. A record whose kind has no summarizer is one nobody has decided the
            // visibility rules for, so it does not go out.
            return null;
        }

        try {
            return summarize(record, viewer);
        } catch (error) {
            this.logError(`summarizeFor:${record.kind}`, record.kind, error);
            return null;
        }
    }

    private logError(descriptorName: string, eventName: string, error: unknown): void {
        const seen = this.errorCounts.get(descriptorName) ?? 0;
        this.errorCounts.set(descriptorName, seen + 1);
        if (seen >= AnimationRecorder.MaxLoggedErrorsPerDescriptor) {
            return;
        }

        logger.error('Animation descriptor failed', {
            descriptor: descriptorName,
            eventName,
            gameId: this.game.id,
            error: error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) },
        });
    }
}
