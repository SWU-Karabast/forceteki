import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CarsonTevaTheresSomethingGoingOn extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7521690984',
            internalName: 'carson-teva#theres-something-going-on',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While attacking, this unit deals combat damage before the defender.',
            condition: (context) => context.source.isAttacking(),
            ongoingEffect: AbilityHelper.ongoingEffects.dealsCombatDamageFirst(),
        });
    }
}