import { AbilityContext } from '../../../AbilityContext';
import { AbilityTypes, CardTypes, Durations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class DaiTsuchi extends DrawCard {
    static id = 'dai-tsuchi';

    public setupCardAbilities() {
        this.attachmentConditions({
            cardCondition: (card) => card instanceof DrawCard && card.printedMilitarySkill >= 3
        });

        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Return attachment to owners hand',
                condition: (context: AbilityContext<DrawCard>) => context.source.isParticipating('military'),
                target: {
                    cardType: CardTypes.Attachment,
                    cardCondition: (card, context) =>
                        card instanceof DrawCard &&
                        card.parent instanceof DrawCard &&
                        card.parent.isParticipatingFor(context.player.opponent),
                    gameAction: AbilityDsl.actions.returnToHand()
                },
                gameAction: AbilityDsl.actions.playerLastingEffect((context) => ({
                    duration: Durations.UntilEndOfConflict,
                    targetController: context.target.owner,
                    effect: AbilityDsl.effects.playerCannot({
                        cannot: 'play',
                        restricts: 'copiesOfX',
                        params: context.target.name
                    })
                })),
                effect: "return {0} to {1}'s hand and prevent them from playing copies this conflict",
                effectArgs: (context: AbilityContext) => [context.target.owner]
            })
        });
    }
}