import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SenatorsAide extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4539059769',
            internalName: 'senators-aide'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you have the initiative, this unit gets +2/+0.',
            condition: (context) => context.player.hasInitiative(),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}
