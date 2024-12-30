import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CaptainRexLeadByExample extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0511508627',
            internalName: 'captain-rex#lead-by-example'
        };
    }

    protected override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Create 2 Clone Trooper tokens.',
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper({ amount: 2 })
        });
    }
}

CaptainRexLeadByExample.implemented = true;
