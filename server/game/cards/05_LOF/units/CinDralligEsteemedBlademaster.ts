import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class CinDralligEsteemedBlademaster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7787879864',
            internalName: 'cin-drallig#esteemed-blademaster',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'You may play a Lightsaber upgrade from your hand for free on this unit',
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUpgrade() && card.hasSomeTrait(Trait.Lightsaber),
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand((context) => ({
                    adjustCost: { costAdjustType: CostAdjustType.Free },
                    playAsType: WildcardCardType.Upgrade,
                    attachTargetCondition: (attachTarget) => attachTarget === context.source
                }))
            },
            ifYouDo: {
                title: 'Ready him',
                immediateEffect: AbilityHelper.immediateEffects.ready(),
            }
        });
    }
}