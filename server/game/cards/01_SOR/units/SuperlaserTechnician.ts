import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Location } from '../../../core/Constants';

export default class SuperlaserTechnician extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8954587682',
            internalName: 'superlaser-technician'
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Put Superlaser Technician into play as a resource and ready it',
            optional: true,
            //TODO: figure out how to change this from sequential to simultaneous while keeing the ready effect
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.resourceCard({ target: this }),
                //TODO: update resourceCard to handle this
                AbilityHelper.immediateEffects.ready((context) => ({ target: context.source }))])
        });
    }
}

SuperlaserTechnician.implemented = true;