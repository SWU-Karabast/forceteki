import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DuchesssProtector extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2943731349',
            internalName: 'duchesss-protector',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Create a Mandalorian token',
            immediateEffect: abilityHelper.immediateEffects.createMandalorian()
        });
    }
}
