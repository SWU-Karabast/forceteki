import { AbilityContext } from '../ability/AbilityContext';
import CardAbilityStep from '../ability/CardAbilityStep';
import { AbilityType } from '../Constants';
import { TriggeredAbilityWindow } from '../gameSteps/abilityWindow/TriggeredAbilityWindow';
import { BaseStepWithPipeline } from '../gameSteps/BaseStepWithPipeline';
import { SimpleStep } from '../gameSteps/SimpleStep';
import * as Contract from '../utils/Contract';

export enum TriggerHandlingMode {

    /** Any abilities triggered during this event window will not be resolved immediately but passed to the parent window */
    PassesTriggersToParentWindow = 'passesTriggersToParentWindow',

    /** Any abilities triggered during this event window or passed up from child windows will be resolved immediately  */
    ResolvesTriggers = 'resolvesTriggers',

    /** This event window is not a type that should trigger abilities, so any triggers that happen are an error */
    CannotHaveTriggers = 'cannotHaveTriggers'
}

interface IThenAbilityComponents {
    generator: (context: AbilityContext) => CardAbilityStep;
    context: AbilityContext;
    condition?: (context: AbilityContext) => boolean;
}

export class EventWindow extends BaseStepWithPipeline {
    protected _events: any[] = [];
    protected _triggeredAbilityWindow?: TriggeredAbilityWindow = null;

    private previousGameEventWindow?: EventWindow = null;
    private resolvedEvents: any[] = [];
    private subwindowEvents: any[] = [];
    private thenAbilityComponents?: IThenAbilityComponents = null;
    private windowDepth?: number = null;

    public get events() {
        return this._events;
    }

    public get triggeredAbilityWindow() {
        if (this.triggerHandlingMode === TriggerHandlingMode.CannotHaveTriggers) {
            Contract.fail(`Attempting to access triggered ability window for type(s) ${this} which cannot trigger abilities`);
        }

        return this._triggeredAbilityWindow;
    }

    /** Creates an object holding one or more GameEvents that occur at the same time.
     *  @param game - The game object.
     *  @param {GameEvent[]} events - Events belonging to this window.
     *  @param {boolean} ownsTriggerWindow - Whether this event window should create its own TriggeredAbilityWindow which will resolve after its events(and any nested events).
     * If false, this window will borrow its parent EventWindow's TriggeredAbilityWindow, which will receive any triggers that trigger during this EventWindow's events,
     * to be resolved after all nested events of its owner are done.
     */
    public constructor(
        game,
        events,
        private readonly triggerHandlingMode: TriggerHandlingMode = TriggerHandlingMode.PassesTriggersToParentWindow
    ) {
        super(game);

        events.forEach((event) => {
            if (!event.cancelled) {
                this.addEvent(event);
            }
        });

        this.initialise();
    }

    public initialise() {
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

    public addEvent(event) {
        event.setWindow(this);
        this._events.push(event);
        return event;
    }

    public removeEvent(event) {
        this._events = this._events.filter((e) => e !== event);
        return event;
    }

    public setThenAbilityStep(
        thenAbilityGenerator: (context: AbilityContext) => CardAbilityStep,
        context: AbilityContext,
        condition: (context: AbilityContext) => boolean = null
    ) {
        Contract.assertIsNullLike(this.thenAbilityComponents, 'Attempting to set event window\'s then ability but it is already set');

        this.thenAbilityComponents = { generator: thenAbilityGenerator, context, condition };
    }

    public addSubwindowEvents(events) {
        this.subwindowEvents = this.subwindowEvents.concat(events);
    }

    private setCurrentEventWindow() {
        this.previousGameEventWindow = this.game.currentEventWindow;
        this.windowDepth = this.previousGameEventWindow ? this.previousGameEventWindow.windowDepth + 1 : 0;

        if (this.windowDepth >= 50) {
            throw new Error('Event window depth has reached 50, likely caught in an infinite loop');
        }

        this.game.currentEventWindow = this;

        switch (this.triggerHandlingMode) {
            case TriggerHandlingMode.PassesTriggersToParentWindow:
                Contract.assertNotNullLike(this.previousGameEventWindow, `Attempting to create event window ${this} as a child window but no parent window exists`);
                this._triggeredAbilityWindow = this.previousGameEventWindow.triggeredAbilityWindow;
                break;
            case TriggerHandlingMode.ResolvesTriggers:
                this._triggeredAbilityWindow = new TriggeredAbilityWindow(this.game, this, AbilityType.Triggered);
                break;
            case TriggerHandlingMode.CannotHaveTriggers:
                this._triggeredAbilityWindow = null;
                break;
            default:
                Contract.fail(`Unknown value for triggerHandlingMode: ${this.triggerHandlingMode}`);
        }
    }

    private checkEventCondition() {
        this._events.forEach((event) => event.checkCondition());
    }

    private openReplacementEffectWindow() {
        if (this._events.length === 0) {
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
    private generateContingentEvents() {
        let contingentEvents = [];
        this._events.forEach((event) => {
            contingentEvents = contingentEvents.concat(event.generateContingentEvents());
        });
        contingentEvents.forEach((event) => this.addEvent(event));
    }

    private preResolutionEffects() {
        this._events.forEach((event) => event.preResolutionEffect());
    }

    protected executeHandlersEmitEvents() {
        const eventsToResolve = this._events.sort((event) => event.order);

        // we emit triggered abilities here to ensure that they get triggered in case e.g. a card is defeated during event resolution
        if (this.triggerHandlingMode !== TriggerHandlingMode.CannotHaveTriggers) {
            this._triggeredAbilityWindow.addTriggeringEvents(this._events);
            this._triggeredAbilityWindow.emitEvents();
        }

        for (const event of eventsToResolve) {
            // need to checkCondition here to ensure the event won't fizzle due to another event's resolution (e.g. double honoring an ordinary character with YR etc.)
            event.checkCondition();
            if (!event.cancelled) {
                event.executeHandler();

                this.resolvedEvents.push(event);
            }
        }
    }

    // resolve game state and emit triggers again
    // this is to catch triggers on cards that entered play or gained abilities during event resolution
    private resolveGameStateAndEmitEvents() {
        // TODO: understand if resolveGameState really needs the resolvedEvents array or not
        this.game.resolveGameState(this.resolvedEvents.some((event) => event.handler), this.resolvedEvents);

        for (const event of this.resolvedEvents) {
            this.game.emit(event.name, event);
        }

        // trigger again here to catch any events for cards that entered play during event resolution
        if (this.triggerHandlingMode !== TriggerHandlingMode.CannotHaveTriggers) {
            this._triggeredAbilityWindow.emitEvents();
        }
    }

    // resolve any events queued for a subwindow (typically defeat events)
    private resolveSubwindowEvents() {
        if (this.subwindowEvents.length > 0) {
            this.queueStep(new EventWindow(this.game, this.subwindowEvents));
        }
    }


    // if the effect has an additional "then" step, resolve it
    private resolveThenAbilityStep() {
        if (this.thenAbilityComponents == null) {
            return;
        }

        const context = this.thenAbilityComponents.context;
        const thenAbility = this.thenAbilityComponents.generator(context);

        const condition = this.thenAbilityComponents.condition ?? (() => true);
        if (context.events.every((event) => condition(event))) {
            this.game.resolveAbility(thenAbility.createContext(context.player));
        }
    }

    private resolveTriggersIfNecessary() {
        if (this.triggerHandlingMode === TriggerHandlingMode.ResolvesTriggers) {
            this.queueStep(this._triggeredAbilityWindow);
        }
    }

    private cleanup() {
        for (const event of this.resolvedEvents) {
            event.cleanup();
        }

        if (this.previousGameEventWindow) {
            this.previousGameEventWindow.checkEventCondition();
            this.game.currentEventWindow = this.previousGameEventWindow;
        } else {
            this.game.currentEventWindow = null;
        }
    }

    public override toString() {
        return `'EventWindow: ${this._events.map((event) => event.name).join(', ')}'`;
    }
}
