import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ScimitarSithInfiltrator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1540696516',
            internalName: 'scimitar#sith-infiltrator',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While this unit is damaged, it gets +3/+0',
            condition: (context) => context.source.damage > 0,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 })
        });
    }
}