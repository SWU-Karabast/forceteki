import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ConfederateCourier extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3680942691',
            internalName: 'confederate-courier'
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Create a Battle Droid token.',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid()
        });
    }
}

ConfederateCourier.implemented = true;