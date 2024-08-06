import { CardTypes } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class MeditationsOnTheTao extends ProvinceCard {
    static id = 'meditations-on-the-tao';
    setupCardAbilities() {
        this.action({
            title: 'Remove a fate from a character',
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isAttacking(),
                gameAction: AbilityDsl.actions.removeFate()
            }
        });
    }
}
