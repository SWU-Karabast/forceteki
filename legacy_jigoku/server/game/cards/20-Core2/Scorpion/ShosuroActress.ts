import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Locations, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class ShosuroActress extends DrawCard {
    static id = 'shosuro-actress';

    setupCardAbilities() {
        this.action({
            title: `Put an opponent's character into play`,
            cost: AbilityDsl.costs.sacrificeSelf(),
            target: {
                cardType: CardTypes.Character,
                location: [Locations.ConflictDiscardPile, Locations.DynastyDiscardPile],
                controller: Players.Opponent,
                cardCondition: (card) => card.costLessThan(4) && !card.hasTrait('shinobi'),
                gameAction: AbilityDsl.actions.putIntoConflict()
            }
        });
    }
}
