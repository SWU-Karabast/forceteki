import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { CardTypes, EffectNames, EventNames, Locations } from '../Constants';
import type DrawCard from '../drawcard';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface PutInProvinceProperties extends CardActionProperties {
    destination?: Locations;
    switch?: boolean;
    switchTarget?: DrawCard;
    faceup?: boolean;
    changePlayer?: boolean;
    canBeStronghold?: boolean;
    discardDestinationCards?: boolean;
}

export class PutInProvinceAction extends CardGameAction {
    name = 'putInProvince';
    eventName = EventNames.OnCardLeavesPlay;
    targetType = [CardTypes.Character, CardTypes.Attachment];
    defaultProperties: PutInProvinceProperties = {
        destination: null,
        switch: false,
        switchTarget: null,
        faceup: true,
        canBeStronghold: false,
        changePlayer: false,
        discardDestinationCards: false
    };
    constructor(properties: PutInProvinceProperties | ((context: AbilityContext) => PutInProvinceProperties)) {
        super(properties);
    }

    getCostMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context) as PutInProvinceProperties;
        return ['putting {0} into {1}}', [properties.target, properties.destination]];
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context) as PutInProvinceProperties;
        let destinationController = Array.isArray(properties.target)
            ? properties.changePlayer
                ? properties.target[0].controller.opponent
                : properties.target[0].controller
            : properties.changePlayer
            ? properties.target.controller.opponent
            : properties.target.controller;
        return ["move {0} to {1}'s {2}", [properties.target, destinationController, properties.destination]];
    }

    canAffect(card: BaseCard, context: AbilityContext, additionalProperties = {}): boolean {
        const { changePlayer, destination } = this.getProperties(
            context,
            additionalProperties
        ) as PutInProvinceProperties;
        const canMove =
            (!changePlayer || card.checkRestrictions(EffectNames.TakeControl, context)) &&
            (!destination || context.player.isLegalLocationForCard(card, destination)) &&
            card.location === Locations.PlayArea &&
            super.canAffect(card, context);
        return canMove;
    }

    eventHandler(event, additionalProperties = {}): void {
        let context = event.context;
        let card = event.card;
        event.cardStateWhenMoved = card.createSnapshot();
        let properties = this.getProperties(context, additionalProperties) as PutInProvinceProperties;
        if (properties.switch && properties.switchTarget) {
            let otherCard = properties.switchTarget;
            card.owner.moveCard(otherCard, card.location);
        }

        const player = card.owner;
        if (card.isConflict && [...context.game.getProvinceArray()].includes(properties.destination)) {
            context.game.addMessage("{0} is discarded instead since it can't enter a province legally!", card);
            properties.destination = Locations.ConflictDiscardPile;
        }
        if (
            properties.discardDestinationCards &&
            context.game.getProvinceArray(false).includes(properties.destination)
        ) {
            let cardsToDiscard = player.getSourceList(properties.destination).filter((card) => card.isDynasty);
            for (const card of cardsToDiscard) {
                player.moveCard(card, Locations.DynastyDiscardPile);
            }
        }
        player.moveCard(card, properties.destination);
        if (properties.faceup) {
            card.facedown = false;
        }
        card.checkForIllegalAttachments();
    }
}
