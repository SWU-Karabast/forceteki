import type { AbilityContext } from '../ability/AbilityContext';
import { EventName } from '../Constants';
import Player from '../Player';

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
    public createContingentEvents = (event) => [];
    public preResolutionEffect = () => true;

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
        if (this.cancelled || this.resolved || this.name === EventName.Unnamed) {
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
}
