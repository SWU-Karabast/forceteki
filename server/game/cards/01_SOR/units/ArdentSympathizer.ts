import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ArdentSympathizer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6348804504',
            internalName: 'ardent-sympathizer'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While you have the initiative, this unit gets +2/+0.',
            condition: (context) => context.source.controller.hasInitiative(),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}
