import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { CardTypes, EventNames, Stages } from '../Constants';
import { Event } from '../Events/Event';
import type Player from '../player';
import type Ring from '../ring';
import type { StatusToken } from '../StatusToken';

type PlayerOrRingOrCardOrToken = Player | Ring | BaseCard | StatusToken;

export interface GameActionProperties {
    target?: PlayerOrRingOrCardOrToken | PlayerOrRingOrCardOrToken[];
    cannotBeCancelled?: boolean;
    optional?: boolean;
    parentAction?: GameAction<GameActionProperties>;
}

export class GameAction<P extends GameActionProperties = GameActionProperties> {
    propertyFactory?: (context?: AbilityContext) => P;
    properties?: P;
    targetType: string[] = [];
    eventName = EventNames.Unnamed;
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
            ((context.stage === Stages.Effect && cannotBeCancelled) || target.checkRestrictions(this.name, context))
        );
    }

    #targets(context: AbilityContext, additionalProperties = {}) {
        return this.getProperties(context, additionalProperties).target as PlayerOrRingOrCardOrToken[];
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
        const event = new Event(EventNames.Unnamed, { cannotBeCancelled });
        event.checkFullyResolved = (eventAtResolution) =>
            this.isEventFullyResolved(eventAtResolution, target, context, additionalProperties);
        return event;
    }

    resolve(
        target: undefined | PlayerOrRingOrCardOrToken | PlayerOrRingOrCardOrToken[],
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

    moveFateEventCondition(event): boolean {
        if (event.origin) {
            if (event.origin.getFate() === 0) {
                return false;
            } else if (
                event.origin.type === CardTypes.Character &&
                !event.origin.allowGameAction('removeFate', event.context)
            ) {
                return false;
            }
        }
        if (event.recipient) {
            if (
                event.recipient.type === CardTypes.Character &&
                !event.recipient.allowGameAction('placeFate', event.context)
            ) {
                return false;
            }
        }
        return !!event.origin || !!event.recipient;
    }

    moveFateEventHandler(event): void {
        if (event.origin) {
            event.fate = Math.min(event.fate, event.origin.getFate());
            event.origin.modifyFate(-event.fate);
        }
        if (event.recipient) {
            event.recipient.modifyFate(event.fate);
        }
    }

    hasTargetsChosenByInitiatingPlayer(context: AbilityContext, additionalProperties = {}): boolean {
        return false;
    }
}