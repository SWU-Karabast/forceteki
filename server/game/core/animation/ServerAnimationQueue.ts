import type { AnimationEvent, AnimationQueue } from './AnimationTypes';
import { AnimationType } from './AnimationTypes';

/**
 * Manages animation queue during game state updates on the server.
 * Handles queuing, optimization, and serialization of animation events.
 */
export class ServerAnimationQueue {
    private events: AnimationEvent[] = [];
    private sequenceCounter = 0;

    /**
     * Adds a single animation event to the queue.
     *
     * @param event - Animation event to add
     */
    public add(event: AnimationEvent): void {
        this.events.push(event);
    }

    /**
     * Adds multiple animation events to the queue.
     *
     * @param events - Array of animation events to add
     */
    public addMultiple(events: AnimationEvent[]): void {
        this.events.push(...events);
    }

    /**
     * Optimizes the animation queue by combining duplicate or similar events.
     * - Combines damage/heal events on the same target
     * - Eliminates duplicate state changes
     */
    public optimize(): void {
        if (this.events.length === 0) {
            return;
        }

        // Group events by type and target for potential combining
        const damageMap = new Map<string, AnimationEvent>();
        const healMap = new Map<string, AnimationEvent>();
        const otherEvents: AnimationEvent[] = [];

        for (const event of this.events) {
            if (event.type === AnimationType.Damage) {
                this.combineNumericEvent(damageMap, event);
            } else if (event.type === AnimationType.Heal) {
                this.combineNumericEvent(healMap, event);
            } else {
                // For shield break animations, don't deduplicate - we need each individual shield animation
                // Multiple shields on the same unit need separate animations
                if (event.type === AnimationType.LoseShield) {
                    otherEvents.push(event);
                } else {
                    // For other event types, check for exact duplicates
                    const isDuplicate = otherEvents.some((existing) =>
                        existing.type === event.type &&
                        existing.targetId === event.targetId &&
                        existing.sourceId === event.sourceId
                    );

                    if (!isDuplicate) {
                        otherEvents.push(event);
                    }
                }
            }
        }

        // Rebuild events array with combined results
        this.events = [
            ...Array.from(damageMap.values()),
            ...Array.from(healMap.values()),
            ...otherEvents,
        ];

        // Sort by priority (highest first)
        this.events.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Combines numeric value events (damage/heal) on the same target.
     */
    private combineNumericEvent(
        map: Map<string, AnimationEvent>,
        event: AnimationEvent
    ): void {
        const existing = map.get(event.targetId);

        if (existing && event.value !== undefined) {
            // Combine the values
            existing.value = (existing.value ?? 0) + event.value;

            // If either event is part of a simultaneous group, preserve that
            if (event.metadata?.isSimultaneous || existing.metadata?.isSimultaneous) {
                existing.metadata = existing.metadata ?? {};
                existing.metadata.isSimultaneous = true;
            }
        } else {
            map.set(event.targetId, { ...event });
        }
    }

    /**
     * Serializes the queue for transmission to the client.
     *
     * @returns Serialized animation queue or null if empty
     */
    public serialize(): AnimationQueue | null {
        if (this.events.length === 0) {
            return null;
        }

        return {
            events: this.events,
            timestamp: Date.now(),
            sequenceId: `seq-${++this.sequenceCounter}`,
        };
    }

    /**
     * Clears all events from the queue.
     */
    public clear(): void {
        this.events = [];
    }

    /**
     * Returns the current number of events in the queue.
     */
    public size(): number {
        return this.events.length;
    }

    /**
     * Returns true if the queue is empty.
     */
    public isEmpty(): boolean {
        return this.events.length === 0;
    }
}
