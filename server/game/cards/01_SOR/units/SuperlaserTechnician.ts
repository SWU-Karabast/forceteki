import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

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
            immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({ target: context.source, readyResource: true }))
        });
    }
}
