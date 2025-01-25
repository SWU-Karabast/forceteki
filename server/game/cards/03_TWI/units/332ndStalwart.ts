import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class _332ndStalwart extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1209133362',
            internalName: '332nd-stalwart',
        };
    }

    public override setupCardAbilities () {
        this.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'This unit gets +1/+1',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 })
        });
    }
}
