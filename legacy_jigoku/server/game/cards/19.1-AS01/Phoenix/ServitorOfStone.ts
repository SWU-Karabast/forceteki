import type { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import { CardTypes } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class ServitorOfStone extends DrawCard {
    static id = 'servitor-of-stone';

    public setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => this.controllerHasShugenjaAtSameLocation(context),
            effect: AbilityDsl.effects.cardCannot({ cannot: 'leavePlay' })
        });

        this.persistentEffect({
            effect: AbilityDsl.effects.delayedEffect({
                condition: (context: AbilityContext) => !this.controllerHasShugenjaAtSameLocation(context),
                message: '{0} is discarded from play because {1} controls no Shugenja at their location',
                messageArgs: (context: AbilityContext) => [context.source, context.player],
                gameAction: AbilityDsl.actions.discardFromPlay()
            })
        });
    }

    private controllerHasShugenjaAtSameLocation(context: AbilityContext) {
        return context.player.anyCardsInPlay(
            (otherCard: BaseCard) =>
                otherCard.type === CardTypes.Character &&
                otherCard.hasTrait('shugenja') &&
                context.source.isInConflict() === otherCard.isInConflict()
        );
    }
}
