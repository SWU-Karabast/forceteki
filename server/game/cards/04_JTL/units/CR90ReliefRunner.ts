import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class CR90ReliefRunner extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7610382003',
            internalName: 'cr90-relief-runner'
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Heal up to 3 damage from a unit or base',
            immediateEffect: AbilityHelper.immediateEffects.distributeHealingAmong({
                amountToDistribute: 3,
                controller: WildcardRelativePlayer.Any,
                canChooseNoTargets: true,
                cardTypeFilter: [WildcardCardType.Unit, CardType.Base],
                maxTargets: 1
            })
        });
    }
}
