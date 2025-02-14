import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BatchBrothers extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6969421569',
            internalName: 'batch-brothers',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Create a Clone Trooper token.',
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper()
        });
    }
}