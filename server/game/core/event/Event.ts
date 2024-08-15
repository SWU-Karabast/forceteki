import type { AbilityContext } from '../ability/AbilityContext';
import { EventName } from '../Constants';
import Player from '../Player';

// TODO: rename to GameEvent to disambiguate from DOM events
export class Event {
    cancelled = false;
    resolved = false;
    context = null;
    window = null;
    replacementEvent = null;
    condition = (event) => true;
    order = 0;
    isContingent = false;
    checkFullyResolved = (event) => !event.cancelled;
    createContingentEvents = () => [];
    preResolutionEffect = () => true;

    constructor(
        public name: string,
        params: any,
        private handler?: (event: Event) => void
    ) {
        for (const key in params) {
            if (key in params) {
                this[key] = params[key];
            }
        }
    }

    cancel() {
        this.cancelled = true;
        if (this.window) {
            this.window.removeEvent(this);
        }
    }

    setWindow(window) {
        this.window = window;
    }

    unsetWindow() {
        this.window = null;
    }

    checkCondition() {
        if (this.cancelled || this.resolved || this.name === EventName.Unnamed) {
            return;
        }
        if (!this.condition(this)) {
            this.cancel();
        }
    }

    getResolutionEvent() {
        if (this.replacementEvent) {
            return this.replacementEvent.getResolutionEvent();
        }
        return this;
    }

    isFullyResolved() {
        return this.checkFullyResolved(this.getResolutionEvent());
    }

    executeHandler() {
        this.resolved = true;
        if (this.handler) {
            this.handler(this);
        }
    }

    replaceHandler(newHandler) {
        this.handler = newHandler;
    }
}
