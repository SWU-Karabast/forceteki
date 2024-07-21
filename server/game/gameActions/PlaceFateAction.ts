import { AbilityContext } from '../AbilityContext';
import { CardTypes, EventNames, Locations } from '../Constants';
import type DrawCard from '../drawcard';
import type Player from '../player';
import Ring from '../ring';
import { CardGameAction, type CardActionProperties } from './CardGameAction';

export interface PlaceFateProperties extends CardActionProperties {
    amount?: number;
    origin?: DrawCard | Player | Ring;
}

export class PlaceFateAction extends CardGameAction {
    name = 'placeFate';
    eventName = EventNames.OnMoveFate;
    targetType = [CardTypes.Character];
    defaultProperties: PlaceFateProperties = { amount: 1 };
    constructor(properties: ((context: AbilityContext) => PlaceFateProperties) | PlaceFateProperties) {
        super(properties);
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        const { amount, target } = this.getProperties(context) as PlaceFateProperties;
        return ['place {1} fate on {0}', [target, amount]];
    }

    canAffect(card: DrawCard, context: AbilityContext, additionalProperties = {}): boolean {
        const { amount, origin } = this.getProperties(context, additionalProperties) as PlaceFateProperties;
        if (amount === 0 || card.location !== Locations.PlayArea) {
            return false;
        }

        if (origin instanceof Ring && !context.player.checkRestrictions('takeFateFromRings', context)) {
            return false;
        }

        return super.canAffect(card, context) && this.checkOrigin(context, origin) && card !== origin;
    }

    checkOrigin(context: AbilityContext, origin?: Player | Ring | DrawCard): boolean {
        if (!origin) {
            return true;
        }

        return (
            origin.fate > 0 &&
            (origin.type === 'player' || origin.type === 'ring' || origin.allowGameAction('removeFate', context))
        );
    }

    addPropertiesToEvent(event, card: DrawCard, context: AbilityContext, additionalProperties): void {
        const { amount, origin } = this.getProperties(context, additionalProperties) as PlaceFateProperties;
        event.fate = amount;
        event.origin = origin;
        event.context = context;
        event.recipient = card;
    }

    checkEventCondition(event): boolean {
        return this.moveFateEventCondition(event);
    }

    isEventFullyResolved(event, card: DrawCard, context: AbilityContext, additionalProperties): boolean {
        const { amount, origin } = this.getProperties(context, additionalProperties) as PlaceFateProperties;
        return (
            !event.cancelled &&
            event.name === this.eventName &&
            event.fate === amount &&
            event.origin === origin &&
            event.recipient === card
        );
    }

    eventHandler(event): void {
        this.moveFateEventHandler(event);
    }
}
