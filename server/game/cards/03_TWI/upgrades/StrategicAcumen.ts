import AbilityHelper from '../../../AbilityHelper';
import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class StrategicAcumen extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '2397845395',
            internalName: 'strategic-acumen',
        };
    }

    protected override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addGainActionAbilityTargetingAttached({
            title: 'Play a unit from your hand. It costs 1 less',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                // TODO remove cardTypeFilter but fix Choose nothing button before
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 },
                    playAsType: WildcardCardType.Unit
                })
            }
        });
    }
}
