import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { EventNames, Locations } from '../Constants';
import { CardGameAction, type CardActionProperties } from './CardGameAction';

export interface LookAtProperties extends CardActionProperties {
    message?: string | ((context) => string);
    messageArgs?: (cards: any) => any[];
}

export class LookAtAction extends CardGameAction {
    name = 'lookAt';
    eventName = EventNames.OnLookAtCards;
    effect = 'look at a facedown card';
    defaultProperties: LookAtProperties = {
        message: '{0} sees {1}'
    };

    canAffect(card: BaseCard, context: AbilityContext) {
        if (!card.isFacedown() && (card.isInProvince() || card.location === Locations.PlayArea)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    addEventsToArray(events: any[], context: AbilityContext, additionalProperties = {}): void {
        let { target } = this.getProperties(context, additionalProperties);
        let cards = (target as BaseCard[]).filter((card) => this.canAffect(card, context));
        if (cards.length === 0) {
            return;
        }
        let event = this.createEvent(null, context, additionalProperties);
        this.updateEvent(event, cards, context, additionalProperties);
        events.push(event);
    }

    addPropertiesToEvent(event, cards, context: AbilityContext, additionalProperties): void {
        if (!cards) {
            cards = this.getProperties(context, additionalProperties).target;
        }
        if (!Array.isArray(cards)) {
            cards = [cards];
        }
        event.cards = cards;
        let obj = { a: cards, b: context };
        event.stateBeforeResolution = cards.map((a) => {
            return { card: a, location: a.location };
        });
        event.context = context;
    }

    eventHandler(event, additionalProperties = {}): void {
        let context = event.context;
        let properties = this.getProperties(context, additionalProperties) as LookAtProperties;
        let messageArgs = properties.messageArgs ? properties.messageArgs(event.cards) : [context.source, event.cards];
        context.game.addMessage(this.getMessage(properties.message, context), ...messageArgs);
    }

    getMessage(message, context): string {
        if (typeof message === 'function') {
            return message(context);
        }
        return message;
    }

    isEventFullyResolved(event): boolean {
        return !event.cancelled && event.name === this.eventName;
    }

    checkEventCondition(): boolean {
        return true;
    }
}
