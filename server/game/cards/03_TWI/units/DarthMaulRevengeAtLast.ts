import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DarthMaulRevengeAtLast extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8613680163',
            internalName: 'darth-maul#revenge-at-last'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'This unit can attack 2 units instead of 1',
            ongoingEffect: AbilityHelper.ongoingEffects.canAttackMultipleUnitsSimultaneously({
                amount: 2
            })
        });
    }
}
