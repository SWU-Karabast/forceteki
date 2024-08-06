import { CardTypes } from '../../Constants';
import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class ShizukaToshi extends StrongholdCard {
    static id = 'shizuka-toshi';

    setupCardAbilities() {
        this.action({
            title: 'Bow a character',
            condition: () => this.game.isDuringConflict('political'),
            cost: AbilityDsl.costs.bowSelf(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating() && card.politicalSkill <= 2,
                gameAction: AbilityDsl.actions.bow()
            }
        });
    }
}
