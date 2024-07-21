import type { AbilityContext } from '../AbilityContext';
import { CardTypes, EventNames, Locations } from '../Constants';
import type DrawCard from '../drawcard';
import type Player from '../player';
import type Ring from '../ring';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface PlaceFateAttachmentProperties extends CardActionProperties {
    amount?: number;
    origin?: DrawCard | Player | Ring;
}

export class PlaceFateAttachmentAction extends CardGameAction {
    name = 'placeFate';
    eventName = EventNames.OnMoveFate;
    targetType = [CardTypes.Attachment];
    defaultProperties: PlaceFateAttachmentProperties = { amount: 1 };
    constructor(
        properties: ((context: AbilityContext) => PlaceFateAttachmentProperties) | PlaceFateAttachmentProperties
    ) {
        super(properties);
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let { amount, target } = this.getProperties(context) as PlaceFateAttachmentProperties;
        return ['place {1} fate on {0}', [target, amount]];
    }

    canAffect(card: DrawCard, context: AbilityContext, additionalProperties = {}): boolean {
        let { amount, origin } = this.getProperties(context, additionalProperties) as PlaceFateAttachmentProperties;
        if (amount === 0 || card.location !== Locations.PlayArea) {
            return false;
        }

        if (origin && this.isRing(origin) && !context.player.checkRestrictions('takeFateFromRings', context)) {
            return false;
        }

        return super.canAffect(card, context) && this.checkOrigin(origin, context) && card !== origin;
    }

    isRing(x: any): x is Ring {
        return 'element' in x;
    }

    checkOrigin(origin: Player | Ring | DrawCard, context: AbilityContext): boolean {
        if (origin) {
            if (origin.fate === 0) {
                return false;
            } else if (['player', 'ring'].includes(origin.type)) {
                return true;
            }
            return origin.allowGameAction('removeFate', context);
        }
        return true;
    }

    addPropertiesToEvent(event, card: DrawCard, context: AbilityContext, additionalProperties): void {
        let { amount, origin } = this.getProperties(context, additionalProperties) as PlaceFateAttachmentProperties;
        event.fate = amount;
        event.origin = origin;
        event.context = context;
        event.recipient = card;
    }

    checkEventCondition(event): boolean {
        return this.moveFateEventCondition(event);
    }

    isEventFullyResolved(event, card: DrawCard, context: AbilityContext, additionalProperties): boolean {
        let { amount, origin } = this.getProperties(context, additionalProperties) as PlaceFateAttachmentProperties;
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
