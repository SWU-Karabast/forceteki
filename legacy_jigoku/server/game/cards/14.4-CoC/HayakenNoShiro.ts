import { CardTypes } from '../../Constants';
import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class HayakenNoShiro extends StrongholdCard {
    static id = 'hayaken-no-shiro';

    setupCardAbilities() {
        this.action({
            title: 'Ready a character',
            cost: AbilityDsl.costs.bowSelf(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.hasTrait('bushi') && card.costLessThan(3),
                gameAction: AbilityDsl.actions.ready()
            }
        });
    }
}
