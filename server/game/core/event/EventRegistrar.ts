import type Game from "../Game";

interface IEventHandler {
    name: string;
    handler: (event: any) => void;
}

/**
 * Simplifies event registration given an event emitter to listen to events and
 * a context object to bind handlers on.
 */
export class EventRegistrar {
    private events: IEventHandler[];

    constructor(
        private game: Game,
        private context: unknown
    ) {
        this.events = [];
    }

    /**
     * Registers a series of event handlers by name on the context object. Takes
     * an array representing the events to be registered. If an array element is
     * a string, then it will listen to that event using a handler method of the
     * same name on the context object. If the array element is an object, the
     * keys of the object will be used as the events to listen on and the string
     * values will be used as the method names on the context object.
     *
     * @example
     * // Listen to event 'eventName' and bind context.eventName as the handler.
     * this.register(['eventName']);
     * // Listen to event 'eventName' and bind context.methodName as the handler.
     * this.register([{ eventName: 'methodName' }]);
     *
     * @param {Array} events - A list containing a mix of event names and
     * event-to-method mappings.
     */
    public register(events: Array<string | Record<string, string>>) {
        for (const event of events) {
            if (typeof event === 'string') {
                this.registerEvent(event);
            } else {
                for (const eventName in event) {
                    const methodName = event[eventName];
                    this.registerEvent(eventName, methodName);
                }
            }
        }
    }

    /**
     * Registers a single event handler.
     */
    public registerEvent(eventName: string, methodName = '') {
        const method = this.context[methodName || eventName];
        if (typeof method !== 'function') {
            throw new Error(`Cannot bind event handler for ${eventName}`);
        }

        const boundHandler = method.bind(this.context);
        this.game.on(eventName, boundHandler);
        this.events.push({ name: eventName, handler: boundHandler });
    }

    /**
     * Unbinds all registered handlers from the event emitter.
     */
    public unregisterAll() {
        for (const event of this.events) {
            this.game.removeListener(event.name, event.handler);
        }
        this.events = [];
    }
}
