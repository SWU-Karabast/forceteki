import { CardTypes } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class ApprenticeEarthcaller extends DrawCard {
    static id = 'apprentice-earthcaller';

    setupCardAbilities() {
        this.action({
            title: 'Set skill values to printed values',
            condition: () => this.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isAttacking() && card.attachments.length === 0,
                gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                    effect: [
                        AbilityDsl.effects.setMilitarySkill(context.target.printedMilitarySkill),
                        AbilityDsl.effects.setPoliticalSkill(context.target.printedPoliticalSkill)
                    ]
                }))
            },
            effect: "set {0}'s skill values to their printed values until the end of the conflict"
        });
    }
}
