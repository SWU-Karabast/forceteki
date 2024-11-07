import { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import { CardType, EventName, GameStateChangeRequired, MetaEventName, Stage } from '../Constants';
import { GameEvent } from '../event/GameEvent';
import type Player from '../Player';
import type PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import type Game from '../Game';
import * as Helpers from '../utils/Helpers';
import { TriggerHandlingMode } from '../event/EventWindow';
import * as Contract from '../utils/Contract';

type PlayerOrCard = Player | Card;

export interface IGameSystemProperties {
    target?: PlayerOrCard | PlayerOrCard[];
    cannotBeCancelled?: boolean;

    /** @deprecated TODO: evaluate whether to remove this */
    optional?: boolean;
    parentSystem?: GameSystem;
    isCost?: boolean;

    /** If this system is for a contingent event, provide the source event it is contingent on */
    contingentSourceEvent?: any;
}

// TODO: see which base classes can be made abstract
/**
 * Base class for making structured changes to game state. Almost all effects, actions,
 * costs, etc. should use a {@link GameSystem} object to impact the game state.
 *
 * @template TProperties Property class to use for configuring the behavior of the system's execution
 */
// TODO: could we remove the default generic parameter so that all child classes are forced to declare it
export abstract class GameSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IGameSystemProperties = IGameSystemProperties> {
    public readonly name: string = ''; // TODO: should these be abstract?
    public readonly costDescription: string = '';
    public readonly effectDescription: string = '';

    protected readonly propertyFactory?: (context?: TContext) => TProperties;
    protected readonly properties?: TProperties;
    protected abstract readonly eventName: EventName | MetaEventName;
    protected readonly defaultProperties: IGameSystemProperties = { cannotBeCancelled: false, optional: false };
    protected getDefaultTargets: (context: TContext) => any = (context) => this.defaultTargets(context);

    protected abstract isTargetTypeValid(target: any): boolean;

    /**
     * Helper method for adding an additional property onto the `propertiesOrPropertyFactory` signature accepted
     * by the {@link GameSystem} constructor.
     *
     * This is useful in cases where a derived GameSystem type wants to hide one or more ctor properties inherited from
     * the parent class so it can force them to be a specific value, for situations like the example below.
     * See GiveShieldSystem for an example of how to use this method.
     *
     * @example
     * // more flexible version has 'tokenType' as a property
     * const giveTokenSystem = new GiveTokenUpgradeSystem({ tokenType: TokenType.Shield, amount: 2, ...other props... });
     *
     * // more specific version used in most cases
     * const giveShieldSystem = new GiveShieldSystem({ amount: 2 ...other props... });
     *
     * @param propertiesOrPropertyFactory The constructor argument to be appended to
     * @param added Object with properties to append
     * @returns `propertiesOrPropertyFactory` with the values of `added` appended to it
     */
    public static appendToPropertiesOrPropertyFactory<T, TProp extends Extract<keyof T, string>>(propertiesOrPropertyFactory: Omit<T, TProp> | ((context?) => Omit<T, TProp>), added: Pick<T, TProp>) {
        let result: T | ((context?) => T) = null;
        if (typeof propertiesOrPropertyFactory === 'function') {
            result = ((context?) => Object.assign(propertiesOrPropertyFactory(context), added)) as (context?) => T;
        } else {
            result = Object.assign(propertiesOrPropertyFactory, added) as T;
        }

        return result;
    }

    /**
     * Constructs a {@link GameSystem} with a parameter that is either:
     * 1. Preset properties in a {@link TProperties}, which will be set to {@link GameSystem.properties}.
     * 2. A function for generating properties from an {@link TContext} provided at system resolution time,
     * which represents the context of the {@link PlayerOrCardAbility} that is executing this system.
     * This is set to {@link GameSystem.propertyFactory}.
     */
    public constructor(propertiesOrPropertyFactory: TProperties | ((context?: TContext) => TProperties)) {
        if (typeof propertiesOrPropertyFactory === 'function') {
            this.propertyFactory = propertiesOrPropertyFactory;
        } else {
            this.properties = propertiesOrPropertyFactory;
        }
    }

    /**
     * Method for handling the execution of the {@link GameSystem}. This is where the system's effect is applied to the game state.
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties to extend the default ones with
     */
    // IMPORTANT: this method is referred to in the debugging guide. if we change the signature, we should upgrade the guide.
    public abstract eventHandler(event: GameEvent, additionalProperties: any): void;

    /**
     * Composes a property object for configuring the {@link GameSystem}'s execution using the following sources, in order of decreasing priority:
     * - `this.properties ?? this.propertyFactory(context)`
     * - `additionalProperties` parameter
     * - `this.defaultProperties`
     * - a default `properties.target` value set to `this.getDefaultTargets(context)`
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties on top of the default ones
     * @returns An object of the `GameSystemProperties` template type
     */
    public generatePropertiesFromContext(context: TContext, additionalProperties: any = {}): TProperties {
        this.validateContext(context);

        const properties = Object.assign(
            { target: this.getDefaultTargets(context) },
            this.defaultProperties,
            additionalProperties,
            this.properties ?? this.propertyFactory?.(context)
        );
        if (!Array.isArray(properties.target)) {
            properties.target = [properties.target];
        }
        properties.target = properties.target.filter(Boolean);
        return properties;
    }

    public getCostMessage(context: TContext): undefined | [string, any[]] {
        return [this.costDescription, []];
    }

    public getEffectMessage(context: TContext, additionalProperties: any = {}): [string, any[]] {
        const { target } = this.generatePropertiesFromContext(context, additionalProperties);
        return [this.effectDescription, [target]];
    }

    // TODO: is there a type we can provide for 'target'? Is it more than just players and cards?
    /**
     * Evaluates whether the {@link GameSystem}'s execution can legally affect the passed target
     * @param target Target under consideration
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties to extend the default ones with
     * @param mustChangeGameState If set to true, `canAffect` will only return true if the effect will alter game state.
     * False by default as ability effects can still be triggered even if they will not change game state.
     * @returns True if the target is legal for the system, false otherwise
     */
    // IMPORTANT: this method is referred to in the debugging guide. if we change the signature, we should upgrade the guide.
    public canAffect(target: any, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { cannotBeCancelled } = this.generatePropertiesFromContext(context, additionalProperties);

        return (
            this.isTargetTypeValid(target) &&
            !context.gameActionsResolutionChain.includes(this) &&
            ((context.stage === Stage.Effect && cannotBeCancelled) || !target.hasRestriction(this.name, context))
        );
    }

    /**
     * Evaluates whether any of the provided targets for this {@link GameSystem} are legal for this system to act on
     * given the current game state. See {@link GameSystem.generatePropertiesFromContext} for details on target generation.
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties to extend the default ones with
     * @param mustChangeGameState If set to true, will only consider targets legal if applying the effect on thmem will alter game state.
     * False by default as ability effects can still be triggered even if they will not change game state.
     * @returns True if any of the candidate targets are legal, false otherwise
     */
    // TODO: update the type for additionalProperties everywhere to be Record<string, any> since it's always a flat object
    public hasLegalTarget(context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        for (const candidateTarget of this.targets(context, additionalProperties)) {
            if (this.canAffect(candidateTarget, context, additionalProperties, mustChangeGameState)) {
                return true;
            }
        }
        return false;
    }


    /**
     * Evaluates whether all of the provided targets for this {@link GameSystem} are legal for this system to act on
     * given the current game state. See {@link GameSystem.generatePropertiesFromContext} for details on target generation.
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties to extend the default ones with
     * @param mustChangeGameState If set to true, will only consider targets legal if applying the effect on thmem will alter game state.
     * False by default as ability effects can still be triggered even if they will not change game state.
     * @returns True if all of the candidate targets are legal, false otherwise
     */
    public allTargetsLegal(context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        for (const candidateTarget of this.targets(context, additionalProperties)) {
            if (!this.canAffect(candidateTarget, context, additionalProperties, mustChangeGameState)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Generates events to apply the effects of this system to the game state by generating one event per configured target.
     * Targets must be configured either using the system initialization properties or context properties.
     *
     * The generated events will be pushed onto the `events` parameter array. Many implementations of this method will
     * accomplish this by queueing game steps that generate the events, so anything that would leverage the generated events
     * (typically an event window) must be queued as its own game step so it is guaranteed to resolve after events are generated.
     *
     * @param events Generated events will be appended to this list
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties to extend the default ones with
     */
    public queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: any = {}): void {
        for (const target of this.targets(context, additionalProperties)) {
            if (this.canAffect(target, context, additionalProperties)) {
                events.push(this.generateRetargetedEvent(target, context, additionalProperties));
            }
        }
    }

    /**
     * Generates one {@link GameEvent} object that will apply the effects of this system to the game state
     * for the specified target.
     * The event must be emitted using an {@link EventWindow}, typically via `Game.openEventWindow`.
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties to extend the default ones with
     */
    public generateEvent(context: TContext, additionalProperties: any = {}): GameEvent {
        const { target } = this.generatePropertiesFromContext(context, additionalProperties);

        const event = this.createEvent(target, context, additionalProperties);
        this.updateEvent(event, target, context, additionalProperties);
        return event;
    }

    /**
     * Generates one {@link GameEvent} object that will apply the effects of this system to the game state
     * for the specified target.
     * The event must be emitted using an {@link EventWindow}, typically via `Game.openEventWindow`.
     * @param target Target to apply the system's effects to
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties to extend the default ones with
     */
    public generateRetargetedEvent(target: any, context: TContext, additionalProperties: any = {}): GameEvent {
        const event = this.createEvent(target, context, additionalProperties);
        this.updateEvent(event, target, context, additionalProperties);
        return event;
    }

    /**
     * Overrides the default {@link GameSystem.getDefaultTargets} method used by the {@link GameSystem} to extract
     * default targets from an {@link AbilityContext} if an explicit target is not provided at system execution time
     */
    public setDefaultTargetFn(func: (context: TContext) => any): void {
        this.getDefaultTargets = func;
    }

    /**
     * Resolves the effects of the system on game state by generating the necessary events and
     * opening a window to resolve them with {@link Game.openEventWindow}.
     */
    public resolve(
        target: undefined | PlayerOrCard | PlayerOrCard[],
        context: TContext,
        triggerHandlingMode: TriggerHandlingMode = TriggerHandlingMode.PassesTriggersToParentWindow
    ): void {
        if (target) {
            this.setDefaultTargetFn(() => target);
        }

        const events = [];
        this.queueGenerateEventGameSteps(events, context);
        context.game.queueSimpleStep(() => context.game.openEventWindow(events, triggerHandlingMode), `openEventWindow for '${this}'`);
    }

    public checkEventCondition(event: GameEvent, additionalProperties: any = {}): boolean {
        return true;
    }

    public isOptional(context: TContext, additionalProperties: any = {}): boolean {
        return this.generatePropertiesFromContext(context, additionalProperties).optional ?? false;
    }

    public hasTargetsChosenByInitiatingPlayer(context: TContext, additionalProperties: any = {}): boolean {
        return false;
    }

    protected addPropertiesToEvent(event: any, target: any, context: TContext, additionalProperties: any = {}): void {
        const { contingentSourceEvent } = this.generatePropertiesFromContext(context, additionalProperties);

        event.contingentSourceEvent = contingentSourceEvent;
    }

    /**
     * Create a very basic blank event object. Important properties must be added via {@link GameSystem.updateEvent}.
     */
    protected createEvent(target: any, context: TContext, additionalProperties): GameEvent {
        const { cannotBeCancelled } = this.generatePropertiesFromContext(context, additionalProperties);
        const event = new GameEvent(this.eventName, context, { cannotBeCancelled });
        return event;
    }

    /**
     * Writes the important properties of this system onto the passed event object. Only used internally by
     * systems during event generation.
     */
    protected updateEvent(event: GameEvent, target: any, context: TContext, additionalProperties: any = {}): void {
        this.addPropertiesToEvent(event, target, context, additionalProperties);
        event.setHandler((event) => this.eventHandler(event, additionalProperties));
        event.condition = () => this.checkEventCondition(event, additionalProperties);
    }

    /**
     * Method for evaluating default targets from an {@link AbilityContext} in case explicit targets aren't provided
     * at execution time. Returns `[]` by default, will typically be overridden with a more specific method using
     * {@link GameSystem.setDefaultTargetFn} by the caller if intended to be used.
     * @param context Context of ability being executed
     * @returns List of default targets extracted from {@link context} (`[]` by default)
     */
    protected defaultTargets(context: TContext): any[] {
        return [];
    }

    /**
     * Determines what the candidate targets of this {@link GameSystem} are given the context and properties.
     * See {@link GameSystem.generatePropertiesFromContext} for details on target generation.
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties to extend the default ones with
     * @returns The default target(s) of this {@link GameSystem}
     */
    private targets(context: TContext, additionalProperties: any = {}) {
        this.validateContext(context);

        return Helpers.asArray(this.generatePropertiesFromContext(context, additionalProperties).target);
    }

    public toString() {
        return `'GameSystem: ${this.name}'`;
    }

    private validateContext(context: TContext) {
        Contract.assertTrue(context instanceof AbilityContext, `context must be an AbilityContext, instead found ${context}`);
    }
}
