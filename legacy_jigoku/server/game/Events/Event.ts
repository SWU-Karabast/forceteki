import type { AbilityContext } from '../AbilityContext';
import { EventNames } from '../Constants';

type Params = {
    amount: number;
    context: AbilityContext;
    cannotBeCancelled: boolean;
};

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
        params: Partial<Params>,
        private handler?: (event: Event & Partial<Params>) => void
    ) {
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
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
        if (this.cancelled || this.resolved || this.name === EventNames.Unnamed) {
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