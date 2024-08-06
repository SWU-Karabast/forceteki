import { CardTypes, Durations, Locations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class ShibaYohana extends DrawCard {
    static id = 'shiba-yohana';

    public setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Prevent this character from leaving play',
            when: {
                onCardLeavesPlay: (event, context) =>
                    event.card === context.source && event.card.location === Locations.PlayArea
            },
            effect: 'prevent {1} from leaving play - vengeance and destruction sustains her in a damned existence',
            effectArgs: (context) => context.event.card,
            gameAction: AbilityDsl.actions.cancel((context) => ({
                target: context.source,
                replacementGameAction: AbilityDsl.actions.taint()
            })),
            then: (context) => ({
                gameAction: AbilityDsl.actions.cardLastingEffect({
                    target: context.source,
                    duration: Durations.Custom,
                    until: {
                        onCardLeavesPlay: (event) => event.card === context.source
                    },
                    effect: AbilityDsl.effects.addTrait('spirit')
                })
            })
        });

        this.action({
            title: 'Move a character into the conflict',
            condition: (context) => context.source.isParticipating(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isHonored || card.isDishonored,
                gameAction: AbilityDsl.actions.moveToConflict()
            }
        });
    }
}