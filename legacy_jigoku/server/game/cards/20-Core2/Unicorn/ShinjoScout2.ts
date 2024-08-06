import { CardTypes, Locations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class ShinjoScout2 extends DrawCard {
    static id = 'shinjo-scout-2';

    setupCardAbilities() {
        this.interrupt({
            title: 'Cancel the province effect',
            when: {
                onCardRevealed: (event, context) =>
                    event.card.type === CardTypes.Province && context.source.isAttacking()
            },
            gameAction: AbilityDsl.actions.selectCard((context) => ({
                activePromptTitle: 'Choose an attacked province',
                hidePromptIfSingleCard: true,
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                cardCondition: (card) => card.isConflictProvince(),
                message: '{0} prevents {1} from triggering its abilities during this conflict',
                messageArgs: (cards) => [context.player, cards],
                gameAction: AbilityDsl.actions.cardLastingEffect({
                    targetLocation: Locations.Provinces,
                    effect: AbilityDsl.effects.cardCannot('triggerAbilities')
                })
            })),
            effect: 'avoid the dangers of their exploration'
        });
    }
}
