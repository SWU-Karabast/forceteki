import { EventName, MetaEventName } from '../Constants';
import * as Contract from '../utils/Contract';
import * as EnumHelpers from '../utils/EnumHelpers';
import { EventWindow } from './EventWindow';
import { AbilityContext } from '../ability/AbilityContext';

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
    public preResolutionEffect = () => true;

    private cleanupHandlers: (() => void)[] = [];
    private _context = null;
    private contingentEventsGenerator?: () => any[] = null;
    private replacementEvent: any = null;
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

        return this.replacementEvent.isResolvedOrReplacementResolved;
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
        Contract.assertIsNullLike(this.replacementEvent, `Attempting to set replacementEvent ${replacementEvent.name} for ${this.name} but it already has a value: ${this.replacementEvent?.name}`);

        this.replacementEvent = replacementEvent;
        this.resolutionStatus = EventResolutionStatus.REPLACED;
    }

    public getResolutionEvent() {
        if (this.replacementEvent) {
            return this.replacementEvent.getResolutionEvent();
        }
        return this;
    }

    public setContingentEventsGenerator(generator: (event) => any[]) {
        Contract.assertIsNullLike(this.contingentEventsGenerator, 'Attempting to set contingentEventsGenerator but it already has a value');

        this.contingentEventsGenerator = () => generator(this);
    }

    public generateContingentEvents(): any[] {
        return this.contingentEventsGenerator ? this.contingentEventsGenerator() : [];
    }

    public addCleanupHandler(handler) {
        this.cleanupHandlers.push(handler);
    }

    public cleanup() {
        for (const handler of this.cleanupHandlers) {
            handler();
        }
    }
}
