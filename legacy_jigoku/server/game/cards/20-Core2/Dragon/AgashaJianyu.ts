import { CardTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type { AbilityContext } from '../../../AbilityContext';

function bonusBase(context: AbilityContext) {
    const elementalTraits = new Set();
    context.player.cardsInPlay.forEach((character: DrawCard) => {
        for (const trait of character.getTraits()) {
            switch (trait) {
                case 'air':
                case 'earth':
                case 'fire':
                case 'void':
                case 'water':
                    elementalTraits.add(trait);
            }
        }
    });
    return elementalTraits.size;
}

export default class AgashaJianyu extends DrawCard {
    static id = 'agasha-jianyu';

    public setupCardAbilities() {
        this.action({
            title: 'Empower a character with the combined strength of the elements',
            condition: (context) => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.cardLastingEffect((context) => {
                    const bonus = bonusBase(context);
                    return {
                        effect: [
                            AbilityDsl.effects.modifyMilitarySkill(2 * bonus),
                            AbilityDsl.effects.modifyPoliticalSkill(1 * bonus)
                        ]
                    };
                })
            },
            effect: 'give {0} +{1}{2}/+{3}{4}',
            effectArgs: (context) => {
                const bonus = bonusBase(context);
                return [2 * bonus, 'military', 1 * bonus, 'political'];
            }
        });
    }
}