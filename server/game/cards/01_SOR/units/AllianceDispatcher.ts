import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class AllianceDispatcher extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2756312994',
            internalName: 'alliance-dispatcher',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play a unit from your hand. It costs 1 less',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                // TODO remove cardTypeFilter but fix Choose nothing button before
                cardTypeFilter: CardType.BasicUnit,
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
