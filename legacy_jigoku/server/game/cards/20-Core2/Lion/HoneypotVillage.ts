import { CardTypes, Players } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';
import type DrawCard from '../../../drawcard';

export default class HoneypotVillage extends ProvinceCard {
    static id = 'honeypot-village';

    setupCardAbilities() {
        this.action({
            title: 'Move a character in',
            target: {
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: (card: DrawCard) => !card.bowed,
                gameAction: AbilityDsl.actions.moveToConflict()
            }
        });
    }
}
