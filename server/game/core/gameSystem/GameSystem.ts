import { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type { EventName, MetaEventName } from '../Constants';
import { GameStateChangeRequired } from '../Constants';
import { GameEvent } from '../event/GameEvent';
import type { Player } from '../Player';
import { Helpers } from '../utils/Helpers';
import { TriggerHandlingMode } from '../event/EventWindow';
import { Contract } from '../utils/Contract';
import type { GameObject } from '../GameObject';
import type { MsgArg } from '../chat/GameChat';
import type { PropsFactory } from '../../Interfaces';

export type PlayerOrCard = Player | Card;

export interface IGameSystemProperties {
    target: PlayerOrCard[];
    cannotBeCancelled?: boolean;

    /** @deprecated TODO: evaluate whether to remove this */
    optional?: boolean;
    isCost?: boolean;

    /** If this system is for a contingent event, provide the source event it is contingent on */
    contingentSourceEvent?: any;

    /** If the game system is a replacement effect */
    replacementEffect?: boolean;
}

export type IGameSystemInput<TProperties> = TProperties extends { target: readonly PlayerOrCard[] } ? Omit<TProperties, 'target'> & {
    target?: TProperties['target'][number] | TProperties['target'];
} : TProperties;

export type GameSystemPropsFactory<TProperties, TContext extends AbilityContext = AbilityContext> =
    PropsFactory<IGameSystemInput<TProperties>, TContext>;

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
    public abstract readonly eventName: EventName | MetaEventName;
    public readonly costDescription: string = '';
    public readonly effectDescription: string = '';

    protected readonly propertyFactory?: (context?: TContext) => IGameSystemInput<TProperties>;
    protected readonly properties?: IGameSystemInput<TProperties>;
    protected readonly defaultProperties: Partial<IGameSystemInput<IGameSystemProperties>> = { cannotBeCancelled: false, optional: false };
    protected getDefaultTargets: (context: TContext) => any = (context) => this.defaultTargets(context);

    protected abstract isTargetTypeValid(target: GameObject | GameObject[]): boolean;

    /**
     * Helper method for adding an additional property onto the `propertiesOrPropertyFactory` signature accepted
     * by the {@link GameSystem} constructor.
     *
     * This is useful in cases where a factory method (or derived GameSystem type) wants to hide one or more ctor
     * properties inherited from the parent class so it can force them to be a specific value, for situations like the
     * example below. See the `giveShield`/`createSpy` factory methods in GameSystemLibrary for example usages.
     *
     * @example
     * // general system exposes 'tokenType' as a property
     * const giveTokenSystem = new GiveTokenUpgradeSystem({ tokenType: TokenUpgradeName.Shield, amount: 2, ...other props... });
     *
     * // factory method injects the tokenType so callers don't have to
     * const giveShieldSystem = giveShield({ amount: 2, ...other props... });
     *
     * @param propertiesOrPropertyFactory The constructor argument to be appended to
     * @param added Object with properties to append
     * @returns `propertiesOrPropertyFactory` with the values of `added` appended to it
     */
    public static appendToPropertiesOrPropertyFactory<T, TProp extends Extract<keyof T, string>>(propertiesOrPropertyFactory: Omit<T, TProp> | ((context?) => Omit<T, TProp>), added: Pick<T, TProp>) {
        let result: T | ((context?) => T) = null;
        // assign into a fresh object rather than mutating the caller's input: the same properties object may be reused
        // across multiple factory calls (e.g. MoffJerjerrod building one system per token type from a shared props
        // object), and mutating it would let the last-appended value clobber the others.
        if (typeof propertiesOrPropertyFactory === 'function') {
            result = ((context?) => Object.assign({}, propertiesOrPropertyFactory(context), added)) as (context?) => T;
        } else {
            result = Object.assign({}, propertiesOrPropertyFactory, added) as T;
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
    public constructor(propertiesOrPropertyFactory: GameSystemPropsFactory<TProperties, TContext>) {
        if (typeof propertiesOrPropertyFactory === 'function') {
            this.propertyFactory = propertiesOrPropertyFactory;
        } else {
            this.properties = propertiesOrPropertyFactory;
        }
    }

    /**
     * Method for handling the execution of the {@link GameSystem}. This is where the system's effect is applied to the game state.
     * Generates the effective properties once and passes them to {@link GameSystem.eventHandlerInternal}.
     * @param event Event being resolved
     * @param additionalProperties Any additional properties to extend the default ones with
     */
    // IMPORTANT: this method is referred to in the debugging guide. if we change the signature, we should upgrade the guide.
    public eventHandler(event: GameEvent, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): void {
        const properties = this.generatePropertiesFromContext(event.context as TContext, additionalProperties);
        this.eventHandlerInternal(event, properties, additionalProperties);
    }

    protected abstract eventHandlerInternal(event: GameEvent, properties: TProperties, additionalProperties?: Partial<IGameSystemInput<TProperties>>): void;

    protected canAffectInternal(target: GameObject | GameObject[], context: TContext, properties: TProperties, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): boolean {
        return this.isTargetTypeValid(target);
    }

    /**
     * Composes the effective property object for configuring the {@link GameSystem}'s execution using the following sources, in order of decreasing priority:
     * - `this.properties ?? this.propertyFactory(context)`
     * - `additionalProperties` parameter
     * - `this.defaultProperties`
     * - a default `properties.target` value set to `this.getDefaultTargets(context)`
     *
     * `target` is then normalized to an array (dropping nullish entries) and {@link GameSystem.prepareProperties} is called.
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties on top of the default ones
     * @returns An object of the `GameSystemProperties` template type, with `target` always an array
     */
    public generatePropertiesFromContext(context: TContext, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): TProperties {
        this.validateContext(context);

        const properties = Object.assign(
            { target: this.getDefaultTargets(context) },
            this.defaultProperties,
            additionalProperties,
            this.properties ?? this.propertyFactory?.(context)
        );
        const normalizedProperties = Object.assign(properties, {
            target: Helpers.asArray(properties.target).filter(Boolean)
        }) as TProperties;

        this.prepareProperties(context, normalizedProperties);
        return normalizedProperties;
    }

    /**
     * Hook for subclasses to adjust the effective properties in place after they have been composed and normalized,
     * e.g. to fill in derived defaults. Overrides should call `super.prepareProperties`.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected prepareProperties(context: TContext, properties: TProperties): void {}

    public getCostMessage(context: TContext, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return this.getCostMessageInternal(context, properties, additionalProperties);
    }

    protected getCostMessageInternal(context: TContext, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): [string, any[]] {
        return [this.costDescription, [this.getTargetMessage(properties.target, context)]];
    }

    public getEffectMessage(context: TContext, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return this.getEffectMessageInternal(context, properties, additionalProperties);
    }

    protected getEffectMessageInternal(context: TContext, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): [string, any[]] {
        return [this.effectDescription, [this.getTargetMessage(properties.target, context)]];
    }

    public getTargetMessage(targets: PlayerOrCard | PlayerOrCard[], context: TContext): MsgArg[] {
        return Helpers.asArray(targets).map((target) => {
            if (target.isCard() && target.isBase()) {
                return {
                    format: target.controller === context.player ? 'their base' : '{0}\'s base',
                    args: [target.controller]
                };
            }
            return target;
        });
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
    public canAffect(target: GameObject | GameObject[], context: TContext, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        return this.reportErrorsAsFailure(context, () => {
            const properties = this.generatePropertiesFromContext(context, additionalProperties);
            return this.canAffectInternal(target, context, properties, mustChangeGameState, additionalProperties);
        });
    }

    /**
     * Same as {@link GameSystem.canAffect} but reuses already-generated effective `properties`, for callers that
     * are checking several candidates against one generation.
     */
    protected canAffectWithProperties(target: GameObject | GameObject[], context: TContext, properties: TProperties, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): boolean {
        return this.reportErrorsAsFailure(context, () => this.canAffectInternal(target, context, properties, mustChangeGameState, additionalProperties));
    }

    /**
     * Runs a legality or event-condition check that must not throw. If it errors, the error is reported and the check
     * counts as failed, cancelling one candidate or event instead of aborting resolution partway so as to try and preserve the game state.
     */
    private reportErrorsAsFailure(context: TContext, check: () => boolean): boolean {
        try {
            return check();
        } catch (err) {
            context.game?.reportError(err);
            return false;
        }
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
    public hasLegalTarget(context: TContext, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return this.hasLegalTargetInternal(context, properties, mustChangeGameState, additionalProperties);
    }

    protected hasLegalTargetInternal(context: TContext, properties: TProperties, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): boolean {
        for (const candidateTarget of properties.target) {
            if (this.canAffectWithProperties(candidateTarget, context, properties, mustChangeGameState, additionalProperties)) {
                return true;
            }
        }
        return false;
    }

    /** Whether this system reveals cards. Overridden by {@link RevealSystem}; used to decide when to mask hidden information. */
    public isReveal(): boolean {
        return false;
    }

    /**
     * Evaluates whether all of the provided targets for this {@link GameSystem} are legal for this system to act on
     * given the current game state. See {@link GameSystem.generatePropertiesFromContext} for details on target generation.
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties to extend the default ones with
     * @param mustChangeGameState If set to true, will only consider targets legal if applying the effect on them will alter game state.
     * False by default as ability effects can still be triggered even if they will not change game state.
     * @returns True if all of the candidate targets are legal, false otherwise
     */
    public allTargetsLegal(context: TContext, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return this.allTargetsLegalInternal(context, properties, mustChangeGameState, additionalProperties);
    }

    protected allTargetsLegalInternal(context: TContext, properties: TProperties, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): boolean {
        for (const candidateTarget of properties.target) {
            if (!this.canAffectWithProperties(candidateTarget, context, properties, mustChangeGameState, additionalProperties)) {
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
    public queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        this.queueGenerateEventGameStepsInternal(events, context, properties, additionalProperties);
    }

    protected queueGenerateEventGameStepsInternal(events: GameEvent[], context: TContext, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): void {
        for (const target of properties.target) {
            if (this.canAffectWithProperties(target, context, properties, GameStateChangeRequired.None, additionalProperties)) {
                events.push(this.generateRetargetedEventWithProperties(target, context, properties, additionalProperties));
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
    public generateEvent(context: TContext, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}, addLastKnownInformation: boolean = false): GameEvent {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return this.generateEventInternal(context, properties, addLastKnownInformation, additionalProperties);
    }

    protected generateEventInternal(context: TContext, properties: TProperties, addLastKnownInformation: boolean = false, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): GameEvent {
        return this.generateRetargetedEventWithProperties(properties.target, context, properties, additionalProperties);
    }

    /**
     * Generates one {@link GameEvent} object that will apply the effects of this system to the game state
     * for the specified target.
     * The event must be emitted using an {@link EventWindow}, typically via `Game.openEventWindow`.
     * @param target Target to apply the system's effects to
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties to extend the default ones with
     */
    public generateRetargetedEvent(target: any, context: TContext, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): GameEvent {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return this.generateRetargetedEventWithProperties(target, context, properties, additionalProperties);
    }

    protected generateRetargetedEventWithProperties(target: any, context: TContext, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): GameEvent {
        const event = this.createEvent(target, context, properties, additionalProperties);
        this.updateEvent(event, target, context, properties, additionalProperties);
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

    public checkEventCondition(event: GameEvent, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): boolean {
        const context = event.context as TContext;
        return this.reportErrorsAsFailure(context, () => {
            const properties = this.generatePropertiesFromContext(context, additionalProperties);
            return this.checkEventConditionInternal(event, properties, additionalProperties);
        });
    }

    protected checkEventConditionInternal(event: GameEvent, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): boolean {
        return true;
    }

    public isOptional(context: TContext, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): boolean {
        return this.generatePropertiesFromContext(context, additionalProperties).optional ?? false;
    }

    public hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): boolean {
        // This metadata query must not evaluate factories that depend on targets not yet chosen.
        return false;
    }

    protected addPropertiesToEvent(event: any, target: any, context: TContext, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): void {
        event.contingentSourceEvent = properties.contingentSourceEvent;
        event.player = context.player;
    }

    /**
     * Create a very basic blank event object. Important properties must be added via {@link GameSystem.updateEvent}.
     */
    protected createEvent(target: any, context: TContext, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): GameEvent {
        const event = new GameEvent(this.eventName, context, { cannotBeCancelled: properties.cannotBeCancelled });
        return event;
    }

    /**
     * Writes the important properties of this system onto the passed event object. Only used internally by
     * systems during event generation.
     */
    protected updateEvent(event: GameEvent, target: any, context: TContext, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): void {
        this.addPropertiesToEvent(event, target, context, properties, additionalProperties);
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
    public defaultTargets(context: TContext): any[] {
        return [];
    }

    /**
     * Determines what the candidate targets of this {@link GameSystem} are given the context and properties.
     * See {@link GameSystem.generatePropertiesFromContext} for details on target generation.
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties to extend the default ones with
     * @returns The default target(s) of this {@link GameSystem}
     */
    protected targets(context: TContext, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}) {
        this.validateContext(context);

        return this.generatePropertiesFromContext(context, additionalProperties).target;
    }

    public toString() {
        return `'GameSystem: ${this.name}'`;
    }

    protected validateContext(context: TContext) {
        Contract.assertTrue(context instanceof AbilityContext, `context must be an AbilityContext, instead found ${context}`);
    }
}
