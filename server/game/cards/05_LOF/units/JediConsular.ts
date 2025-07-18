import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class JediConsular extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5482818255',
            internalName: 'jedi-consular',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play a unit from your hand. It costs 2 less',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.useTheForce(),
            ],
            targetResolver: {
                // TODO remove cardTypeFilter but fix Choose nothing button before
                cardTypeFilter: CardType.BasicUnit,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 2 },
                    playAsType: WildcardCardType.Unit
                })
            }
        });
    }
}
