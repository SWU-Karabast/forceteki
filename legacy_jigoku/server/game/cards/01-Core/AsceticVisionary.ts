import { CardTypes } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class AsceticVisionary extends DrawCard {
    static id = 'ascetic-visionary';

    setupCardAbilities() {
        this.action({
            title: 'Ready a character',
            cost: AbilityDsl.costs.payFateToRing(1),
            condition: (context) => context.source.isAttacking(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) =>
                    card.hasTrait('monk') || card.attachments.some((card) => card.hasTrait('monk')),
                gameAction: AbilityDsl.actions.ready()
            }
        });
    }
}
