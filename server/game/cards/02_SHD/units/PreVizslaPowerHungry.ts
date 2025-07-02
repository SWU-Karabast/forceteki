import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class PreVizslaPowerHungry extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3086868510',
            internalName: 'pre-vizsla#power-hungry'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Pay the cost of an upgrade attached to another non-Vehicle unit',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            optional: true,
            targetResolver: {
                activePromptTitle: 'Choose an upgrade to pay the cost of',
                controller: WildcardRelativePlayer.Any,
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card, context) => card.isUpgrade() && card.parentCard !== context.source && !card.parentCard.hasSomeTrait(Trait.Vehicle),
                immediateEffect: AbilityHelper.immediateEffects.payCardPrintedCost((context) => ({
                    player: context.player,
                }))
            },
            ifYouDo: (ifYouDoContext) => ({
                title: ifYouDoContext.target.canAttach(ifYouDoContext.source, ifYouDoContext, ifYouDoContext.player)
                    ? `Take control of ${ifYouDoContext.target.title} and attach it to this unit`
                    : `Defeat ${ifYouDoContext.target.title}`,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: () => ifYouDoContext.target.canAttach(ifYouDoContext.source, ifYouDoContext, ifYouDoContext.player),
                    onTrue: AbilityHelper.immediateEffects.attachUpgrade({
                        newController: RelativePlayer.Self,
                        upgrade: ifYouDoContext.target,
                        target: ifYouDoContext.source,
                    }),
                    onFalse: AbilityHelper.immediateEffects.defeat({ target: ifYouDoContext.target }),
                })
            }),
        });
    }
}