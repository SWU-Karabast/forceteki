import { CardTypes, Durations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class WisdomOfTheWind extends DrawCard {
    static id = 'wisdom-of-the-wind';

    setupCardAbilities() {
        this.action({
            title: 'Give attached character a skill bonus',
            effect: 'honor or dishonor {0}',
            condition: (context) =>
                context.game.isDuringConflict() &&
                context.player.cardsInPlay.some((card: DrawCard) => card.hasTrait('shugenja')),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card: DrawCard) => card.isParticipating(),
                gameAction: AbilityDsl.actions.chooseAction({
                    options: {
                        'Honor this character': {
                            action: AbilityDsl.actions.honor(),
                            message: '{0} chooses to honor {1}'
                        },
                        'Dishonor this character': {
                            action: AbilityDsl.actions.dishonor(),
                            message: '{0} chooses to dishonor {1}'
                        }
                    }
                })
            },
            then: (context) => ({
                gameAction: AbilityDsl.actions.onAffinity({
                    trait: 'air',
                    promptTitleForConfirmingAffinity: 'Make other status tokens be ignored?',
                    gameAction: AbilityDsl.actions.cardLastingEffect({
                        target: context.game.currentConflict
                            .getAttackers()
                            .concat(context.game.currentConflict.getDefenders())
                            .filter((card: DrawCard) => card !== context.target),
                        effect: [
                            AbilityDsl.effects.honorStatusDoesNotModifySkill(),
                            AbilityDsl.effects.honorStatusDoesNotAffectLeavePlay(),
                            AbilityDsl.effects.taintedStatusDoesNotCostHonor()
                        ],
                        duration: Durations.UntilEndOfConflict
                    }),
                    effect: 'make all other status be ignored during this conflict'
                })
            })
        });
    }
}