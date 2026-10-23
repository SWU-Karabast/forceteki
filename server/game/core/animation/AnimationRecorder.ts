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

/** Listens for engine events and records the ones the descriptors handle into an {@link AnimationLog}. */
export class AnimationRecorder {
    private static readonly MaxLoggedErrorsPerDescriptor = 5;

    private readonly log = new AnimationLog();
    private readonly descriptors: IAnimationDescriptor[];
    private readonly summarizersByKind = new Map<AnimationKind, IAnimationDescriptor['summarizeFor']>();
    private readonly errorCounts = new Map<string, number>();

    /** The event window the previous record came from. */
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

    /** Retained records, oldest first. For tests and debugging. */
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

    /** Moves this participant's cursor to the newest record without delivering anything. */
    public resyncParticipant(participantId: string): void {
        this.log.resyncParticipant(participantId);
    }

    /** Drops all retained records, moves every cursor to the newest record and increments the epoch. */
    public resetForRollback(): void {
        this.log.resetForRollback();
    }

    /** Maps each record kind to its descriptor's `summarizeFor`. Throws if two descriptors disagree. */
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
            this.game.on(eventName, (event: any) => this.handleEvent(event));
        }
    }

    private handleEvent(event: any): void {
        for (const descriptor of this.descriptors) {
            const predicate = descriptor.when[event.name];
            if (predicate == null) {
                continue;
            }

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
                this.logError(descriptor.name, event.name, error);
            }
        }
    }

    private appendDraft(draft: AnimationRecordDraft, batch: number): void {
        const stamped: AnimationRecordPreSeq = { ...draft, batch };
        this.log.append(stamped);
    }

    /**
     * Returns the batch id for the next record: the current one if it comes from the same event
     * window as the previous record, otherwise a new one. Records outside any window always get a
     * new one.
     */
    private currentBatch(): number {
        const window = this.game.currentEventWindow;
        if (window == null || window !== this.lastWindow) {
            this.batchId++;
        }
        this.lastWindow = window;
        return this.batchId;
    }

    /** Returns the record for this viewer, or null if its kind has no `summarizeFor` or it throws. */
    private summarizeFor(record: AnimationRecord, viewer: Player | null): AnimationRecord | null {
        const summarize = this.summarizersByKind.get(record.kind);
        if (summarize == null) {
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
