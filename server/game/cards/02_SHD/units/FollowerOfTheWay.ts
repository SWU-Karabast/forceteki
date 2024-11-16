import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class FollowerOfTheWay extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4511413808',
            internalName: 'follower-of-the-way'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While this unit is upgraded, it gets +1/+1',
            condition: (context) => context.source.isUpgraded(),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 })
        });
    }
}

FollowerOfTheWay.implemented = true;