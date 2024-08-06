import { CardTypes } from '../../Constants';
import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class KyudenIkoma extends StrongholdCard {
    static id = 'kyuden-ikoma';

    setupCardAbilities() {
        this.reaction({
            title: 'Bow a non-champion',
            cost: AbilityDsl.costs.bowSelf(),
            when: {
                afterConflict: (event, context) =>
                    event.conflict.loser === context.player &&
                    event.conflict.defendingPlayer !== context.player &&
                    event.conflict.getAttackers() &&
                    event.conflict.getAttackers().length !== 0
            },
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => !card.hasTrait('champion'),
                activePromptTitle: 'Bow a non-champion',
                gameAction: AbilityDsl.actions.bow()
            },
            effect: 'bow {0}.'
        });
    }
}
