import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { CardTypes, EffectNames, EventNames, Locations } from '../Constants';
import type Player from '../player';
import { type CardActionProperties, CardGameAction } from './CardGameAction';

export interface MoveToConflictProperties extends CardActionProperties {
    side?: Player;
}

export class MoveToConflictAction extends CardGameAction {
    name = 'moveToConflict';
    eventName = EventNames.OnMoveToConflict;
    cost = 'moving {0} into the conflict';
    effect = 'move {0} into the conflict';
    targetType = [CardTypes.Character];
    defaultProperties: MoveToConflictProperties = { side: null };

    canAffect(card: BaseCard, context: AbilityContext): boolean {
        let properties = this.getProperties(context) as MoveToConflictProperties;
        if (!super.canAffect(card, context)) {
            return false;
        }
        if (!context.game.currentConflict || card.isParticipating()) {
            return false;
        }

        const player = properties.side || card.controller;

        if (player.isAttackingPlayer()) {
            if (!card.canParticipateAsAttacker()) {
                return false;
            }
        } else if (!card.canParticipateAsDefender()) {
            return false;
        }
        if (card.anyEffect(EffectNames.ParticipatesFromHome)) {
            return false;
        }

        return card.location === Locations.PlayArea;
    }

    addPropertiesToEvent(event, card: BaseCard, context: AbilityContext, additionalProperties): void {
        let properties = this.getProperties(context) as MoveToConflictProperties;
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.side = properties.side || card.controller;
    }

    eventHandler(event): void {
        const player = event.side;

        if (player.isAttackingPlayer()) {
            event.context.game.currentConflict.addAttacker(event.card);
        } else {
            event.context.game.currentConflict.addDefender(event.card);
        }
    }
}
