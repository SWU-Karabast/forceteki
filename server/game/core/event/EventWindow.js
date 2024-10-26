const { BaseStepWithPipeline } = require('../gameSteps/BaseStepWithPipeline.js');
const { TriggeredAbilityWindow } = require('../gameSteps/abilityWindow/TriggeredAbilityWindow');
const { SimpleStep } = require('../gameSteps/SimpleStep.js');
const { AbilityType } = require('../Constants.js');
const Contract = require('../utils/Contract.js');
const { GameEvent } = require('./GameEvent.js');

class EventWindow extends BaseStepWithPipeline {
    /** Creates an object holding one or more GameEvents that occur at the same time.
     *  @param game - The game object.
     *  @param {GameEvent[]} events - Events belonging to this window.
     *  @param {boolean} ownsTriggerWindow - Whether this event window should create its own TriggeredAbilityWindow which will resolve after its events(and any nested events).
     * If false, this window will borrow its parent EventWindow's TriggeredAbilityWindow, which will receive any triggers that trigger during this EventWindow's events,
     * to be resolved after all nested events of its owner are done.
     */
    constructor(game, events, ownsTriggerWindow = false) {
        super(game);

        this.events = [];
        this.emittedEvents = [];
        this.thenAbilityComponents = null;
        events.forEach((event) => {
            if (!event.cancelled) {
                this.addEvent(event);
            }
        });

        this.toStringName = `'EventWindow: ${this.events.map((event) => event.name).join(', ')}'`;

        this.triggeredAbilityWindow = null;

        this.ownsTriggerWindow = ownsTriggerWindow;

        this.subwindowEvents = [];

        this.windowDepth = -1;

        this.initialise();
    }

    initialise() {
        this.pipeline.initialise([
            new SimpleStep(this.game, () => this.setCurrentEventWindow(), 'setCurrentEventWindow'),
            new SimpleStep(this.game, () => this.checkEventCondition(), 'checkEventCondition'),
            new SimpleStep(this.game, () => this.openReplacementEffectWindow(), 'openReplacementEffectWindow'),
            new SimpleStep(this.game, () => this.generateContingentEvents(), 'generateContingentEvents'),
            new SimpleStep(this.game, () => this.preResolutionEffects(), 'preResolutionEffects'),
            new SimpleStep(this.game, () => this.executeHandlersEmitEvents(), 'executeHandlersEmitEvents'),
            new SimpleStep(this.game, () => this.resolveGameStateAndEmitEvents(), 'resolveGameStateEmitEvents'),
            new SimpleStep(this.game, () => this.resolveSubwindowEvents(), 'checkSubwindowEvents'),
            new SimpleStep(this.game, () => this.resolveThenAbilityStep(), 'checkThenAbilitySteps'),
            new SimpleStep(this.game, () => this.resolveTriggersIfNecessary(), 'resolveTriggersIfNecessary'),
            new SimpleStep(this.game, () => this.cleanup(), 'cleanup')
        ]);
    }

    addEvent(event) {
        event.setWindow(this);
        this.events.push(event);
        return event;
    }

    removeEvent(event) {
        this.events = this.events.filter((e) => e !== event);
        return event;
    }

    setThenAbilityStep(thenAbilityGenerator, context) {
        Contract.assertIsNullLike(this.thenAbilityComponents, 'Attempting to set event window\'s then ability but it is already set');

        this.thenAbilityComponents = { generator: thenAbilityGenerator, context };
    }

    addSubwindowEvents(events) {
        this.subwindowEvents = this.subwindowEvents.concat(events);
    }

    setCurrentEventWindow() {
        this.previousEventWindow = this.game.currentEventWindow;
        this.windowDepth = this.previousEventWindow ? this.previousEventWindow.windowDepth + 1 : 0;

        if (this.windowDepth >= 50) {
            throw new Error('Event window depth has reached 50, likely caught in an infinite loop');
        }

        this.game.currentEventWindow = this;
        if (this.ownsTriggerWindow) {
            this.triggeredAbilityWindow = new TriggeredAbilityWindow(this.game, this, AbilityType.Triggered);
        } else if (this.previousEventWindow) {
            this.triggeredAbilityWindow = this.previousEventWindow.triggeredAbilityWindow;
        } else {
            Contract.fail(`${this.toStringName} set without any TriggeredEventWindow`);
        }
    }

    checkEventCondition() {
        this.events.forEach((event) => event.checkCondition());
    }

    openReplacementEffectWindow() {
        if (this.events.length === 0) {
            return;
        }

        // TODO EFFECTS: will need resolution for replacement effects here
        // not sure if it will need a new window class or can just reuse the existing one
        const replacementEffectWindow = new TriggeredAbilityWindow(this.game, this, AbilityType.ReplacementEffect);
        replacementEffectWindow.emitEvents();
        this.queueStep(replacementEffectWindow);
    }

    /**
     * Creates any "contingent" events which will happen in the same window as the primary event
     * but will be resolved after it in order. The main use case for this is upgrades being
     * defeated at the same time as the parent card holding them.
     */
    generateContingentEvents() {
        let contingentEvents = [];
        this.events.forEach((event) => {
            contingentEvents = contingentEvents.concat(event.generateContingentEvents());
        });
        contingentEvents.forEach((event) => this.addEvent(event));
    }

    preResolutionEffects() {
        this.events.forEach((event) => event.preResolutionEffect());
    }

    executeHandlersEmitEvents() {
        this.eventsToExecute = this.events.sort((event) => event.order);

        // we emit triggered abilities here to ensure that they get triggered in case e.g. a card is defeated during event resolution
        this.triggeredAbilityWindow.addTriggeringEvents(this.events);
        this.triggeredAbilityWindow.emitEvents();

        for (const event of this.eventsToExecute) {
            // need to checkCondition here to ensure the event won't fizzle due to another event's resolution (e.g. double honoring an ordinary character with YR etc.)
            event.checkCondition();
            if (!event.cancelled) {
                event.executeHandler();

                this.emittedEvents.push(event);
            }
        }
    }

    // resolve game state and emit triggers again
    // this is to catch triggers on cards that entered play or gained abilities during event resolution
    resolveGameStateAndEmitEvents() {
        // TODO: understand if resolveGameState really needs the emittedEvents array or not
        this.game.resolveGameState(this.emittedEvents.some((event) => event.handler), this.emittedEvents);

        for (const event of this.emittedEvents) {
            this.game.emit(event.name, event);
        }

        // trigger again here to catch any events for cards that entered play during event resolution
        this.triggeredAbilityWindow.emitEvents();
    }

    // resolve any events queued for a subwindow (typically defeat events)
    resolveSubwindowEvents() {
        if (this.subwindowEvents.length > 0) {
            this.queueStep(new EventWindow(this.game, this.subwindowEvents));
        }
    }


    // if the effect has an additional "then" step, resolve it
    resolveThenAbilityStep() {
        if (this.thenAbilityComponents == null) {
            return;
        }

        const context = this.thenAbilityComponents.context;
        const thenAbility = this.thenAbilityComponents.generator(context);

        const condition = thenAbility.thenCondition || (() => true);
        if (context.events.every((event) => condition(event))) {
            this.game.resolveAbility(thenAbility.createContext(context.player));
        }
    }

    resolveTriggersIfNecessary() {
        if (this.ownsTriggerWindow) {
            this.queueStep(this.triggeredAbilityWindow);
        }
    }

    cleanup() {
        for (const event of this.emittedEvents) {
            event.cleanup();
        }

        if (this.previousEventWindow) {
            this.previousEventWindow.checkEventCondition();
            this.game.currentEventWindow = this.previousEventWindow;
        } else {
            this.game.currentEventWindow = null;
        }
    }

    /** @override */
    toString() {
        return this.toStringName;
    }
}

module.exports = EventWindow;
