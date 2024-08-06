import type { AbilityContext } from '../ability/AbilityContext';
import type Card from '../card/Card';
import { CardType, EventName, Stage } from '../Constants';
import { Event } from '../event/Event';
import type Player from '../Player';

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
 * costs, etc. should use a `GameSystem` object to impact the game.
 */
export class GameSystem<P extends IGameSystemProperties = IGameSystemProperties> {
    propertyFactory?: (context?: AbilityContext) => P;
    properties?: P;
    targetType: string[] = [];
    eventName = EventName.Unnamed;
    name = '';
    cost = '';
    effect = '';
    defaultProperties: P = { cannotBeCancelled: false, optional: false } as P;
    getDefaultTargets: (context: AbilityContext) => any = (context) => this.defaultTargets(context);

    constructor(propertyFactory: P | ((context?: AbilityContext) => P)) {
        if (typeof propertyFactory === 'function') {
            this.propertyFactory = propertyFactory;
        } else {
            this.properties = propertyFactory;
        }
    }

    defaultTargets(context: AbilityContext): any[] {
        return [];
    }

    getProperties(context: AbilityContext, additionalProperties = {}): P {
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
        let { target } = this.getProperties(context, additionalProperties);
        return [this.effect, [target]];
    }

    setDefaultTarget(func: (context: AbilityContext) => any): void {
        this.getDefaultTargets = func;
    }

    canAffect(target: any, context: AbilityContext, additionalProperties = {}): boolean {
        const { cannotBeCancelled } = this.getProperties(context, additionalProperties);
        return (
            this.targetType.includes(target.type) &&
            !context.gameActionsResolutionChain.includes(this) &&
            ((context.stage === Stage.Effect && cannotBeCancelled) || target.checkRestrictions(this.name, context))
        );
    }

    #targets(context: AbilityContext, additionalProperties = {}) {
        return this.getProperties(context, additionalProperties).target as PlayerOrCard[];
    }

    hasLegalTarget(context: AbilityContext, additionalProperties = {}): boolean {
        for (const candidateTarget of this.#targets(context, additionalProperties)) {
            if (this.canAffect(candidateTarget, context, additionalProperties)) {
                return true;
            }
        }
        return false;
    }

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
        const { cannotBeCancelled } = this.getProperties(context, additionalProperties);
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
            this.setDefaultTarget(() => target);
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

    eventHandler(event: any, additionalProperties = {}): void {}

    checkEventCondition(event: Event, additionalProperties = {}): boolean {
        return true;
    }

    isEventFullyResolved(event: Event, target: any, context: AbilityContext, additionalProperties = {}): boolean {
        return !event.cancelled && event.name === this.eventName;
    }

    isOptional(context: AbilityContext, additionalProperties = {}): boolean {
        return this.getProperties(context, additionalProperties).optional ?? false;
    }

    hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}): boolean {
        return false;
    }
}