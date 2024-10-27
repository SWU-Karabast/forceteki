import { EventName, MetaEventName } from '../Constants';
import * as Contract from '../utils/Contract';
import * as EnumHelpers from '../utils/EnumHelpers';

export class GameEvent {
    public cancelled = false;
    public resolved = false;
    public context = null;
    public window = null;
    public replacementEvent = null;
    public condition = (event) => true;
    public order = 0;
    public isContingent = false;
    public checkFullyResolved = (event) => !event.cancelled;
    public preResolutionEffect = () => true;

    private contingentEventsGenerator?: () => any[] = null;
    private cleanupHandlers: (() => void)[] = [];

    public constructor(
        public name: string,
        params: any,
        private handler?: (event: GameEvent) => void
    ) {
        for (const key in params) {
            if (key in params) {
                this[key] = params[key];
            }
        }
    }

    public executeHandler() {
        this.resolved = true;
        if (this.handler) {
            this.handler(this);
        }
    }

    public replaceHandler(newHandler) {
        this.handler = newHandler;
    }

    public cancel() {
        this.cancelled = true;
        if (this.window) {
            this.window.removeEvent(this);
        }
    }

    public setWindow(window) {
        this.window = window;
    }

    public unsetWindow() {
        this.window = null;
    }

    public checkCondition() {
        if (this.cancelled || this.resolved || this.name === MetaEventName.Unnamed) {
            return;
        }
        if (!this.condition(this)) {
            this.cancel();
        }
    }

    public getResolutionEvent() {
        if (this.replacementEvent) {
            return this.replacementEvent.getResolutionEvent();
        }
        return this;
    }

    public isFullyResolved() {
        return this.checkFullyResolved(this.getResolutionEvent());
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
