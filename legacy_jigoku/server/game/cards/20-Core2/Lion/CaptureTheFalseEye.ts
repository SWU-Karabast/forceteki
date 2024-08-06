import { CardTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class CaptureTheFalseEye extends DrawCard {
    static id = 'capture-the-false-eye';

    setupCardAbilities() {
        this.action({
            title: 'Bow a character',
            condition: (context) => context.game.isDuringConflict('military'),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card, context) =>
                    card.isParticipating() &&
                    context.game.currentConflict
                        .getCharacters(context.player)
                        .some(
                            (myCard: DrawCard) => myCard.hasTrait('bushi') && myCard.militarySkill >= card.militarySkill
                        ),
                gameAction: [
                    AbilityDsl.actions.bow(),
                    AbilityDsl.actions.playerLastingEffect((context) => ({
                        targetController: context.player,
                        effect: AbilityDsl.effects.increaseCost({
                            amount: 1,
                            match: (card) => card.type === CardTypes.Event
                        })
                    }))
                ]
            },
            effect: "bow {0}. For this conflict, {1}'s events cost 1 more fate - did {1} walk into a trap?",
            effectArgs: (context) => [context.player]
        });
    }
}