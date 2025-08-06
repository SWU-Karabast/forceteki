import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class KintanIntimidator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9725921907',
            internalName: 'kintan-intimidator',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Exhaust the defender when attacking a unit',
            immediateEffect: AbilityHelper.immediateEffects.exhaust((context) => ({ target: context.source.activeAttack?.getAllTargets() }))
        });
    }
}
