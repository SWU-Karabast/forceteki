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
    private readonly redactorsByKind = new Map<AnimationKind, IAnimationDescriptor['redact']>();
    private readonly errorCounts = new Map<string, number>();

    /**
     * Batch id per event window. Keyed by object identity, which is safe here because
     * `EventWindow` extends `BaseStep` — a plain class, not a `GameObjectBase` — so instances
     * are never snapshotted or restored. A `WeakMap` keeps this from pinning finished windows.
     */
    private readonly batchIds = new WeakMap<EventWindow, number>();
    private nextBatchId = 0;

    public constructor(
        private readonly game: Game,
        descriptors: IAnimationDescriptor[]
    ) {
        this.descriptors = descriptors;
        this.indexRedactors();
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
        return this.log.readFor(participantId, viewer, (record, forViewer) => this.redact(record, forViewer));
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
     * One redactor per record kind, resolved at construction so a missing or ambiguous one is a
     * startup failure rather than a silent information leak at serialization time.
     */
    private indexRedactors(): void {
        for (const descriptor of this.descriptors) {
            for (const kind of descriptor.kinds) {
                const existing = this.redactorsByKind.get(kind);
                if (existing != null && existing !== descriptor.redact) {
                    throw new Error(
                        `Animation kind "${kind}" is claimed by more than one descriptor with differing redact functions (offender: "${descriptor.name}")`
                    );
                }
                this.redactorsByKind.set(kind, descriptor.redact);
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
                const { batch, parentBatch } = this.currentBatch();
                for (const draft of drafts) {
                    this.appendDraft(draft, batch, parentBatch);
                }
            } catch (error) {
                this.logError(descriptor.name, eventName, error);
            }
        }
    }

    private appendDraft(draft: AnimationRecordDraft, batch: number, parentBatch?: number): void {
        const stamped: AnimationRecordPreSeq = { ...draft, batch, parentBatch };
        this.log.append(stamped);
    }

    /**
     * Resolves the batch id for whatever is resolving right now, plus its parent's.
     *
     * The parent matters more than it looks: a unit's damage and the defeat that damage causes
     * land in DIFFERENT windows by design (`UnitProperties.addDamage` defers the defeat check to
     * a post-event-resolution callback, and `checkDefeated` routes the defeat through
     * `game.addSubwindowEvents`). Without `parentBatch` the client has no way to tie the two
     * halves of the commonest animation in the game back together.
     */
    private currentBatch(): { batch: number; parentBatch?: number } {
        const window = this.game.currentEventWindow;
        if (window == null) {
            // Emitted outside any window (e.g. `Game.emitEvent`). Give it a batch of its own.
            return { batch: ++this.nextBatchId };
        }

        return {
            batch: this.batchIdFor(window),
            parentBatch: window.parentEventWindow ? this.batchIdFor(window.parentEventWindow) : undefined,
        };
    }

    private batchIdFor(window: EventWindow): number {
        let id = this.batchIds.get(window);
        if (id === undefined) {
            id = ++this.nextBatchId;
            this.batchIds.set(window, id);
        }
        return id;
    }

    private redact(record: AnimationRecord, viewer: Player | null): AnimationRecord | null {
        const redactor = this.redactorsByKind.get(record.kind);
        if (redactor == null) {
            // Default deny. A record whose kind has no redactor is one nobody has decided the
            // visibility rules for, so it does not go out.
            return null;
        }

        try {
            return redactor(record, viewer);
        } catch (error) {
            this.logError(`redact:${record.kind}`, record.kind, error);
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
