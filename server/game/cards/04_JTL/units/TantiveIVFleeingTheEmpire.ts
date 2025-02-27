import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TantiveIVFleeingTheEmpire extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6854247423',
            internalName: 'tantive-iv#fleeing-the-empire'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Create an X-Wing token.',
            immediateEffect: AbilityHelper.immediateEffects.createXWing()
        });
    }
}
