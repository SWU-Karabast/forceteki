import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class AtTeVanguard extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5350889336',
            internalName: 'atte-vanguard',
        };
    }

    public override setupCardAbilities () {
        this.addWhenDefeatedAbility({
            title: 'Create 2 Clone Trooper tokens',
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper({ amount: 2 })
        });
    }
}

AtTeVanguard.implemented = true;
