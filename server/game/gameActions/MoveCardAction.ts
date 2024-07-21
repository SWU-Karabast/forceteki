import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { CardTypes, EffectNames, Locations } from '../Constants';
import type DrawCard from '../drawcard';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface MoveCardProperties extends CardActionProperties {
    destination?: Locations;
    switch?: boolean;
    switchTarget?: DrawCard;
    shuffle?: boolean;
    faceup?: boolean;
    bottom?: boolean;
    changePlayer?: boolean;
    discardDestinationCards?: boolean;
}

export class MoveCardAction extends CardGameAction {
    name = 'move';
    targetType = [CardTypes.Character, CardTypes.Attachment, CardTypes.Event, CardTypes.Holding];
    defaultProperties: MoveCardProperties = {
        destination: null,
        switch: false,
        switchTarget: null,
        shuffle: false,
        faceup: false,
        bottom: false,
        changePlayer: false,
        discardDestinationCards: false
    };
    constructor(properties: MoveCardProperties | ((context: AbilityContext) => MoveCardProperties)) {
        super(properties);
    }

    getCostMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context) as MoveCardProperties;
        return ['shuffling {0} into their deck', [properties.target]];
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context) as MoveCardProperties;
        let destinationController = Array.isArray(properties.target)
            ? properties.changePlayer
                ? properties.target[0].controller.opponent
                : properties.target[0].controller
            : properties.changePlayer
            ? properties.target.controller.opponent
            : properties.target.controller;
        if (properties.shuffle) {
            return ["shuffle {0} into {1}'s {2}", [properties.target, destinationController, properties.destination]];
        }
        return [
            'move {0} to ' + (properties.bottom ? 'the bottom of ' : '') + "{1}'s {2}",
            [properties.target, destinationController, properties.destination]
        ];
    }

    canAffect(card: BaseCard, context: AbilityContext, additionalProperties = {}): boolean {
        const { changePlayer, destination } = this.getProperties(context, additionalProperties) as MoveCardProperties;
        return (
            (!changePlayer ||
                (card.checkRestrictions(EffectNames.TakeControl, context) &&
                    !card.anotherUniqueInPlay(context.player))) &&
            (!destination || context.player.isLegalLocationForCard(card, destination)) &&
            card.location !== Locations.PlayArea &&
            super.canAffect(card, context)
        );
    }

    eventHandler(event, additionalProperties = {}): void {
        let context = event.context;
        let card = event.card;
        event.cardStateWhenMoved = card.createSnapshot();
        let properties = this.getProperties(context, additionalProperties) as MoveCardProperties;
        if (properties.switch && properties.switchTarget) {
            let otherCard = properties.switchTarget;
            card.owner.moveCard(otherCard, card.location);
        } else {
            this.checkForRefillProvince(card, event, additionalProperties);
        }
        const player = properties.changePlayer && card.controller.opponent ? card.controller.opponent : card.controller;
        if (
            properties.discardDestinationCards &&
            context.game.getProvinceArray(false).includes(properties.destination)
        ) {
            let cardsToDiscard = player.getSourceList(properties.destination).filter((card) => card.isDynasty);
            for (const card of cardsToDiscard) {
                player.moveCard(card, Locations.DynastyDiscardPile);
            }
        }
        player.moveCard(card, properties.destination, { bottom: !!properties.bottom });
        let target = properties.target;
        if (properties.shuffle && (target.length === 0 || card === target[target.length - 1])) {
            if (properties.destination === Locations.ConflictDeck) {
                card.owner.shuffleConflictDeck();
            } else if (properties.destination === Locations.DynastyDeck) {
                card.owner.shuffleDynastyDeck();
            }
        } else if (properties.faceup) {
            card.facedown = false;
        }
        card.checkForIllegalAttachments();
    }
}
