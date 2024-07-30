import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../card/basecard';
import { CardTypes, EffectNames, Locations, isArena } from '../Constants';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface MoveCardProperties extends CardActionProperties {
    destination?: Locations;
    switch?: boolean;
    switchTarget?: BaseCard;
    shuffle?: boolean;
    faceup?: boolean;
    bottom?: boolean;
    changePlayer?: boolean;
    discardDestinationCards?: boolean;
}

export class MoveCardAction extends CardGameAction {
    name = 'move';
    targetType = [CardTypes.Unit, CardTypes.Upgrade, CardTypes.Event];
    defaultProperties: MoveCardProperties = {
        destination: null,
        switch: false,
        switchTarget: null,
        shuffle: false,
        faceup: false,
        bottom: false,
        changePlayer: false,
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
            !isArena(card.location) &&
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
        }
        const player = properties.changePlayer && card.controller.opponent ? card.controller.opponent : card.controller;
        player.moveCard(card, properties.destination, { bottom: !!properties.bottom });
        let target = properties.target;
        if (properties.shuffle && (target.length === 0 || card === target[target.length - 1])) {
            card.owner.shuffleDeck();
        } else if (properties.faceup) {
            card.facedown = false;
        }
        card.checkForIllegalAttachments();
    }
}
