import { EventName, MetaEventName } from '../Constants';
import * as Contract from '../utils/Contract';
import * as EnumHelpers from '../utils/EnumHelpers';
import type { EventWindow } from './EventWindow';
import type { AbilityContext } from '../ability/AbilityContext';

export enum EventResolutionStatus {
    CREATED = 'created',
    CANCELLED = 'cancelled',
    REPLACED = 'replaced',
    RESOLVING = 'resolving',
    RESOLVED = 'resolved'
}

export class GameEvent {
    public readonly isMetaEvent: boolean;
    public condition = (event) => true;
    public order = 0;
    public isContingent = false;

    private cleanupHandlers: (() => void)[] = [];
    private _context = null;
    private contingentEventsGenerator?: () => any[] = null;
    private replacementEventsGenerator?: () => any[] = null;
    private _preResolutionEffect = null;
    private replacementEvents: any[] = [];
    private resolutionStatus: EventResolutionStatus = EventResolutionStatus.CREATED;
    private _window: EventWindow = null;

    public get context(): AbilityContext | null {
        return this._context;
    }

    public get canResolve(): boolean {
        return this.resolutionStatus === EventResolutionStatus.CREATED;
    }

    public get isCancelled() {
        return this.resolutionStatus === EventResolutionStatus.CANCELLED;
    }

    public get isCancelledOrReplaced() {
        return [EventResolutionStatus.CANCELLED, EventResolutionStatus.REPLACED].includes(this.resolutionStatus);
    }

    public get isReplaced() {
        return this.resolutionStatus === EventResolutionStatus.REPLACED;
    }

    public get isResolved() {
        return this.resolutionStatus === EventResolutionStatus.RESOLVED;
    }

    public get isResolvedOrReplacementResolved() {
        if (this.resolutionStatus === EventResolutionStatus.RESOLVED) {
            return true;
        }

        if (this.resolutionStatus !== EventResolutionStatus.REPLACED) {
            return false;
        }

        return this.replacementEvents.every((event) => event.isResolvedOrReplacementResolved);
    }

    public get window(): EventWindow | null {
        return this._window;
    }

    public constructor(
        public name: string,
        context: AbilityContext,
        params: any,
        private handler?: (event: GameEvent) => void
    ) {
        if (EnumHelpers.isEnumValue(name, EventName)) {
            this.isMetaEvent = false;
        } else if (EnumHelpers.isEnumValue(name, MetaEventName)) {
            this.isMetaEvent = true;
        } else {
            Contract.fail(`Unknown event name: ${name}`);
        }

        this._context = context;

        Contract.assertTrue(params == null || !('context' in params), `Attempting set 'context' property for ${this} via params. Context must be set via constructor parameter`);

        for (const key in params) {
            if (key in params) {
                this[key] = params[key];
            }
        }
    }

    public executeHandler() {
        Contract.assertTrue(this.canResolve, `Attempting to execute handler for ${this.name} but it is not in a resolvable state: ${this.resolutionStatus}`);

        this.resolutionStatus = EventResolutionStatus.RESOLVING;
        if (this.handler) {
            this.handler(this);
        }
        this.resolutionStatus = EventResolutionStatus.RESOLVED;
    }

    public setHandler(newHandler) {
        Contract.assertNotNullLike(newHandler, `Attempting to set null handler for ${this.name}`);
        Contract.assertIsNullLike(this.handler, `Attempting to set handler for ${this.name} but it already has a value`);

        this.handler = newHandler;
    }

    public cancel() {
        this.resolutionStatus = EventResolutionStatus.CANCELLED;
        if (this._window) {
            this._window.removeEvent(this);
        }
    }

    public setWindow(window: EventWindow) {
        Contract.assertNotNullLike(window, `Attempting to set null window for ${this.name}`);
        Contract.assertIsNullLike(this._window, `Attempting to set window ${window} for ${this.name} but it already has a value: ${this._window}`);

        this._window = window;
    }

    public checkCondition() {
        if (!this.canResolve) {
            return;
        }
        if (!this.condition(this)) {
            this.cancel();
        }
    }

    // TODO: refactor this to allow for "partial" replacement effects like Boba Fett's Armor
    public setReplacementEvent(replacementEvent: any) {
        Contract.assertNotNullLike(replacementEvent, `Attempting to set null replacementEvent for ${this.name}`);
        Contract.assertNotNullLike(this.replacementEvents, 'GameEvent.replacementEvents can not be null');

        this.replacementEvents.push(replacementEvent);
        this.resolutionStatus = EventResolutionStatus.REPLACED;
    }

    /**
     * Sets the replacement events generator function for this event. When the event is resolved,
     * the generator function will be called to generate any potential replacement events.
     *
     * This is generally used by game systems to set replacement events to handle specific game rules.
     * For example, the `TakeControlOfUnitSystem` uses this to ensure that a leader unit never changes control,
     * but is defeated instead.
     *
     * To create a replacement effect for a card ability (like the Shield token), use the `addReplacementEffectAbility`
     * method on the card instead.
     */
    public setReplacementEventsGenerator(generator: (event) => any[]) {
        Contract.assertIsNullLike(this.replacementEventsGenerator, 'Attempting to set replacementEventGenerator but it already has a value');

        this.replacementEventsGenerator = () => generator(this);
    }

    public generateReplacementEvents(): any[] {
        return this.replacementEventsGenerator ? this.replacementEventsGenerator() : [];
    }

    public setContingentEventsGenerator(generator: (event) => any[]) {
        Contract.assertIsNullLike(this.contingentEventsGenerator, 'Attempting to set contingentEventsGenerator but it already has a value');

        this.contingentEventsGenerator = () => generator(this);
    }

    public generateContingentEvents(): any[] {
        const contingentEvents = this.contingentEventsGenerator ? this.contingentEventsGenerator() : [];

        // recursively generate contingent events in case the new contingent events also have contingent events
        let i = 0;
        while (i < contingentEvents.length) {
            if (i > 1000) {
                throw new Error(`Infinite loop detected in contingent event generation in event ${this.name}. Last event in list: ${contingentEvents[i].name}`);
            }

            const newContingentEvents = contingentEvents[i].generateContingentEvents();
            contingentEvents.push(...newContingentEvents);

            i++;
        }

        return contingentEvents;
    }

    public setPreResolutionEffect(preResolutionEffect: (event) => void) {
        Contract.assertIsNullLike(this._preResolutionEffect, 'Attempting to set preResolutionEffect but it already has a value');

        this._preResolutionEffect = preResolutionEffect;
    }

    public preResolutionEffect() {
        if (this._preResolutionEffect) {
            this._preResolutionEffect(this);
        }
    }

    public addCleanupHandler(handler) {
        this.cleanupHandlers.push(handler);
    }

    public cleanup() {
        for (const handler of this.cleanupHandlers) {
            handler();
        }
    }

    public findEventInReplacements(): GameEvent | undefined {
        if (this._context?.event?.isReplaced && this._context.event?.replacementEvents) {
            return this._context.event.replacementEvents.find((e: any) => e === this);
        }
        return undefined;
    }

    /**
     * Returns the event or its replacement effect events that are resolved.
     *
     * If the event is not resolved, it returns an empty array.
     * If the event is resolved, it returns only itself.
     * If the event has been replaced, it returns all replacement effect events that are resolved.
     *
     * @returns {GameEvent[]} An array of resolved events.
     */
    public get resolvedEvents(): GameEvent[] {
        if (!this.isResolvedOrReplacementResolved) {
            return [];
        }

        if (this.isResolved) {
            return [this];
        }

        return this.replacementEvents.flatMap((event) => event.resolvedEvents);
    }
}
