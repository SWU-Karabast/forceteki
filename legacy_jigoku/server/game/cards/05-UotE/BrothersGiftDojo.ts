import { CardTypes, Players } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class BrothersGiftDojo extends ProvinceCard {
    static id = 'brother-s-gift-dojo';

    setupCardAbilities() {
        this.action({
            title: 'Move a character home',
            limit: AbilityDsl.limit.perRound(2),
            conflictProvinceCondition: () => true,
            cost: AbilityDsl.costs.payHonor(1),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.sendHome()
            }
        });
    }
}
