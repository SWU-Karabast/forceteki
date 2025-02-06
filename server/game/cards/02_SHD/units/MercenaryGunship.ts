import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardRelativePlayer } from '../../../core/Constants';

export default class MercenaryGunship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3577961001',
            internalName: 'mercenary-gunship',
        };
    }

    public override setupCardAbilities() {
        this.addActionAbility({
            title: 'Take control of this unit',
            cost: AbilityHelper.costs.abilityResourceCost(4),
            abilityActivator: WildcardRelativePlayer.Any,
            immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({ newController: context.player }))
        });
    }
}