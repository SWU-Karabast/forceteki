import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CovertBelievers extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8817340309',
            internalName: 'covert-believers',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Create a Mandalorian token',
            immediateEffect: abilityHelper.immediateEffects.createMandalorian()
        });
    }
}