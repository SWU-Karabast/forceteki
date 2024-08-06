import { CardTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import DrawCard from '../../../drawcard';

export default class WrathstormDancer extends DrawCard {
    static id = 'wrathstorm-dancer';

    public setupCardAbilities() {
        this.persistentEffect({
            condition: (context) =>
                context.source.isParticipating() &&
                context.game.findAnyCardsInPlay(
                    (otherCard: BaseCard) =>
                        otherCard !== context.source &&
                        otherCard.type === CardTypes.Character &&
                        otherCard.hasTrait('berserker') &&
                        otherCard.isParticipating()
                ).length > 0,
            effect: AbilityDsl.effects.modifyMilitarySkill(3)
        });
    }
}
