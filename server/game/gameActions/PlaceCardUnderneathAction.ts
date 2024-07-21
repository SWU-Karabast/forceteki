import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { CardTypes } from '../Constants';
import Effects from '../effects';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface PlaceCardUnderneathProperties extends CardActionProperties {
    destination?: BaseCard;
    hideWhenFaceup?: boolean;
}

export class PlaceCardUnderneathAction extends CardGameAction {
    name = 'placeCardUnderneath';
    targetType = [CardTypes.Character, CardTypes.Attachment, CardTypes.Event, CardTypes.Holding];
    defaultProperties: PlaceCardUnderneathProperties = {
        destination: null,
        hideWhenFaceup: true
    };
    constructor(
        properties: PlaceCardUnderneathProperties | ((context: AbilityContext) => PlaceCardUnderneathProperties)
    ) {
        super(properties);
    }

    getCostMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context) as PlaceCardUnderneathProperties;
        return ['placing {0} underneath {1}', [properties.target, properties.destination]];
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context) as PlaceCardUnderneathProperties;
        return ['place {0} underneath {1}', [properties.target, properties.destination]];
    }

    canAffect(card: BaseCard, context: AbilityContext, additionalProperties = {}): boolean {
        const { destination } = this.getProperties(context, additionalProperties) as PlaceCardUnderneathProperties;
        return destination && destination.uuid && super.canAffect(card, context);
    }

    eventHandler(event, additionalProperties = {}): void {
        let context = event.context;
        let card = event.card;
        event.cardStateWhenMoved = card.createSnapshot();
        let properties = this.getProperties(context, additionalProperties) as PlaceCardUnderneathProperties;
        let destination = properties.destination.uuid;

        context.player.moveCard(card, destination);
        card.controller = context.source.controller;
        card.facedown = false;
        if (properties.hideWhenFaceup) {
            card.lastingEffect(() => ({
                until: {
                    onCardMoved: (event) => event.card === card && event.originalLocation === destination
                },
                match: card,
                effect: Effects.hideWhenFaceUp()
            }));
        }
    }
}
