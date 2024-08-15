import type { AbilityContext } from '../core/ability/AbilityContext';
import type Card from '../core/card/Card';
import { CardType, EffectName, Location } from '../core/Constants';
import { isArena } from '../core/utils/EnumHelpers';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import Contract from '../core/utils/Contract';

export interface IMoveCardProperties extends ICardTargetSystemProperties {
    destination?: Location;
    switch?: boolean;
    switchTarget?: Card;
    shuffle?: boolean;
    faceup?: boolean;
    bottom?: boolean;
    changePlayer?: boolean;
    discardDestinationCards?: boolean;
}

/** @deprecated This system was imported from L5R but has not been tested */
export class MoveCardSystem extends CardTargetSystem<IMoveCardProperties> {
    override name = 'move';
    override targetType = [CardType.Unit, CardType.Upgrade, CardType.Event];
    override defaultProperties: IMoveCardProperties = {
        destination: null,
        switch: false,
        switchTarget: null,
        shuffle: false,
        faceup: false,
        bottom: false,
        changePlayer: false,
    };

    override getCostMessage(context: AbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IMoveCardProperties;
        return ['shuffling {0} into their deck', [properties.target]];
    }

    override getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context) as IMoveCardProperties;
        const destinationController = Array.isArray(properties.target)
            ? properties.changePlayer
                ? properties.target[0].controller.opponent
                : properties.target[0].controller
            : properties.changePlayer
                ? properties.target.controller.opponent
                : properties.target.controller;
        if (properties.shuffle) {
            return ['shuffle {0} into {1}\'s {2}', [properties.target, destinationController, properties.destination]];
        }
        return [
            'move {0} to ' + (properties.bottom ? 'the bottom of ' : '') + '{1}\'s {2}',
            [properties.target, destinationController, properties.destination]
        ];
    }

    override canAffect(card: Card, context: AbilityContext, additionalProperties = {}): boolean {
        const { changePlayer, destination } = this.generatePropertiesFromContext(context, additionalProperties) as IMoveCardProperties;
        return (
            (!changePlayer ||
                (!card.hasRestriction(EffectName.TakeControl, context) &&
                    !card.anotherUniqueInPlay(context.player))) &&
            (!destination || context.player.isLegalLocationForCard(card, destination)) &&
            !isArena(card.location) &&
            super.canAffect(card, context)
        );
    }

    eventHandler(event, additionalProperties = {}): void {
        const context = event.context;
        const card = event.card;
        event.cardStateWhenMoved = card.createSnapshot();
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as IMoveCardProperties;
        if (properties.switch && properties.switchTarget) {
            const otherCard = properties.switchTarget;
            card.owner.moveCard(otherCard, card.location);
        }
        const player = properties.changePlayer && card.controller.opponent ? card.controller.opponent : card.controller;
        player.moveCard(card, properties.destination, { bottom: !!properties.bottom });

        let target = properties.target;
        if (Array.isArray(target)) {
            // TODO: should we allow this to move multiple cards at once?
            if (!Contract.assertArraySize(target, 1)) {
                return;
            }

            target = target[0];
        }

        if (properties.shuffle) {
            card.owner.shuffleDeck();
        } else if (properties.faceup) { // TODO: add overrides for other card properties (e.g., exhausted)
            card.facedown = false;
        }
        card.checkForIllegalAttachments();
    }
}
