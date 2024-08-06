import { CardTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class AsceticVisionary2 extends DrawCard {
    static id = 'ascetic-visionary-2';

    setupCardAbilities() {
        this.action({
            title: 'Ready a character',
            cost: AbilityDsl.costs.payFateToRing(1),
            condition: (context) => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.hasTrait('monk'),
                gameAction: AbilityDsl.actions.ready()
            }
        });
    }
}
