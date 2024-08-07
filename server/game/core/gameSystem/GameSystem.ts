import type { AbilityContext } from '../ability/AbilityContext';
import type Card from '../card/Card';
import { CardType, EventName, Stage } from '../Constants';
import { Event } from '../event/Event';
import type Player from '../Player';
import type PlayerOrCardAbility = require('../ability/PlayerOrCardAbility');

type PlayerOrCard = Player | Card;

export interface IGameSystemProperties {
    target?: PlayerOrCard | PlayerOrCard[];
    cannotBeCancelled?: boolean;
    optional?: boolean;
    parentAction?: GameSystem<IGameSystemProperties>;
}

// TODO: see which base classes can be made abstract
/**
 * Base class for making structured changes to game state. Almost all effects, actions,
 * costs, etc. should use a {@link GameSystem} object to impact the game.
 * 
 * @template GameSystemProperties Property class to use for configuring the behavior of the system's execution
 */
export abstract class GameSystem<GameSystemProperties extends IGameSystemProperties = IGameSystemProperties> {
    propertyFactory?: (context?: AbilityContext) => GameSystemProperties;
    properties?: GameSystemProperties;
    targetType: string[] = [];
    eventName = EventName.Unnamed;
    name = '';
    cost = '';
    effect = '';
    defaultProperties: GameSystemProperties = { cannotBeCancelled: false, optional: false } as GameSystemProperties;
    getDefaultTargets: (context: AbilityContext) => any = (context) => this.defaultTargets(context);

    /**
     * Constructs a {@link GameSystem} with either:
     * 1. Preset properties, set as {@link GameSystem.properties}
     * 2. A function for generating properties from an {@link AbilityContext} provided at system resolution time, 
     * which represents the context of the {@link PlayerOrCardAbility} that is executing this system. 
     * This is set as {@link GameSystem.propertyFactory}.
     */
    constructor(propertyFactory: GameSystemProperties | ((context?: AbilityContext) => GameSystemProperties)) {
        if (typeof propertyFactory === 'function') {
            this.propertyFactory = propertyFactory;
        } else {
            this.properties = propertyFactory;
        }
    }

    /**
     * Method for handling the execution of the {@link GameSystem}. This is where the system's effect is applied to the game state.
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties to extend the default ones with
     */
    abstract eventHandler(event: Event, additionalProperties: any): void;

    /**
     * Method for evaluating default targets from an {@link AbilityContext} in case explicit targets aren't provided 
     * at execution time. Returns `[]` by default, will typically be overridden with a more specific method using 
     * {@link GameSystem.setDefaultTargetEvaluator} by the caller if intended to be used.
     * @param context Context of ability being executed
     * @returns List of default targets extracted from {@link context} (`[]` by default)
     */
    defaultTargets(context: AbilityContext): any[] {
        return [];
    }

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
    generatePropertiesFromContext(context: AbilityContext, additionalProperties = {}): GameSystemProperties {
        const properties = Object.assign(
            { target: this.getDefaultTargets(context) },
            this.defaultProperties,
            additionalProperties,
            this.properties ?? this.propertyFactory?.(context) ?? {}
        );
        if (!Array.isArray(properties.target)) {
            properties.target = [properties.target];
        }
        properties.target = properties.target.filter(Boolean);
        return properties;
    }

    getCostMessage(context: AbilityContext): undefined | [string, any[]] {
        return [this.cost, []];
    }

    getEffectMessage(context: AbilityContext, additionalProperties = {}): [string, any[]] {
        let { target } = this.generatePropertiesFromContext(context, additionalProperties);
        return [this.effect, [target]];
    }

    /**
     * Overrides the default {@link GameSystem.getDefaultTargets} method used by the {@link GameSystem} to extract 
     * default targets from an {@link AbilityContext} if an explicit target is not provided at system execution time
     */
    setDefaultTargetEvaluator(func: (context: AbilityContext) => any): void {
        this.getDefaultTargets = func;
    }

    // TODO: is there a type we can provide for 'target'? Is it more than just players and cards?
    /**
     * Evaluates whether the {@link GameSystem}'s execution can legally affect the passed target
     * @param target Target under consideration
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties to extend the default ones with
     * @returns True if the target is legal for the system, false otherwise
     */
    canAffect(target: any, context: AbilityContext, additionalProperties = {}): boolean {
        const { cannotBeCancelled } = this.generatePropertiesFromContext(context, additionalProperties);
        return (
            this.targetType.includes(target.type) &&
            !context.gameActionsResolutionChain.includes(this) &&
            ((context.stage === Stage.Effect && cannotBeCancelled) || target.checkRestrictions(this.name, context))
        );
    }

    /**
     * Determines what the candidate targets of this {@link GameSystem} are given the context and properties. 
     * See {@link GameSystem.generatePropertiesFromContext} for details on target generation.
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties to extend the default ones with
     * @returns The default target(s) of this {@link GameSystem}
     */
    #targets(context: AbilityContext, additionalProperties = {}) {
        return this.generatePropertiesFromContext(context, additionalProperties).target as PlayerOrCard[];
    }

    /**
     * Evaluates whether any of the provided targets for this {@link GameSystem} are legal for this system to act on
     * given the current game state. See {@link GameSystem.generatePropertiesFromContext} for details on target generation.
     * @param context Context of ability being executed
     * @param additionalProperties Any additional properties to extend the default ones with
     * @returns True if any of the candidate targets are legal, false otherwise
     */
    hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        for (const candidateTarget of this.#targets(context, additionalProperties)) {
            if (this.canAffect(candidateTarget, context, additionalProperties)) {
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
     * @returns True if all of the candidate targets are legal, false otherwise
     */
    allTargetsLegal(context: AbilityContext, additionalProperties = {}): boolean {
        for (const candidateTarget of this.#targets(context, additionalProperties)) {
            if (!this.canAffect(candidateTarget, context, additionalProperties)) {
                return false;
            }
        }
        return true;
    }

    addEventsToArray(events: Event[], context: AbilityContext, additionalProperties = {}): void {
        for (const target of this.#targets(context, additionalProperties)) {
            if (this.canAffect(target, context, additionalProperties)) {
                events.push(this.getEvent(target, context, additionalProperties));
            }
        }
    }

    getEvent(target: any, context: AbilityContext, additionalProperties = {}): Event {
        const event = this.createEvent(target, context, additionalProperties);
        this.updateEvent(event, target, context, additionalProperties);
        return event;
    }

    updateEvent(event: Event, target: any, context: AbilityContext, additionalProperties = {}): void {
        event.name = this.eventName;
        this.addPropertiesToEvent(event, target, context, additionalProperties);
        event.replaceHandler((event) => this.eventHandler(event, additionalProperties));
        event.condition = () => this.checkEventCondition(event, additionalProperties);
    }

    createEvent(target: any, context: AbilityContext, additionalProperties): Event {
        const { cannotBeCancelled } = this.generatePropertiesFromContext(context, additionalProperties);
        const event = new Event(EventName.Unnamed, { cannotBeCancelled });
        event.checkFullyResolved = (eventAtResolution) =>
            this.isEventFullyResolved(eventAtResolution, target, context, additionalProperties);
        return event;
    }

    resolve(
        target: undefined | PlayerOrCard | PlayerOrCard[],
        context: AbilityContext
    ): void {
        if (target) {
            this.setDefaultTargetEvaluator(() => target);
        }
        const events = [];
        this.addEventsToArray(events, context);
        context.game.queueSimpleStep(() => context.game.openEventWindow(events));
    }

    getEventArray(context: AbilityContext, additionalProperties = {}): Event[] {
        const events = [];
        this.addEventsToArray(events, context, additionalProperties);
        return events;
    }

    addPropertiesToEvent(event: any, target: any, context: AbilityContext, additionalProperties = {}): void {
        event.context = context;
    }

    checkEventCondition(event: Event, additionalProperties = {}): boolean {
        return true;
    }

    isEventFullyResolved(event: Event, target: any, context: AbilityContext, additionalProperties = {}): boolean {
        return !event.cancelled && event.name === this.eventName;
    }

    isOptional(context: AbilityContext, additionalProperties = {}): boolean {
        return this.generatePropertiesFromContext(context, additionalProperties).optional ?? false;
    }

    hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}): boolean {
        return false;
    }
}