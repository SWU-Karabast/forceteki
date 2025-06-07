import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class AdeptOfAnger extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4024881604',
            internalName: 'adept-of-anger',
        };
    }

    public override setupCardAbilities() {
        this.addActionAbility({
            title: 'Exhaust a unit',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.useTheForce()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}