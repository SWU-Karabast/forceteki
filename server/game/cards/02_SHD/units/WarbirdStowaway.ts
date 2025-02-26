import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class WarbirdStowaway extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8305828130',
            internalName: 'warbird-stowaway'
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
