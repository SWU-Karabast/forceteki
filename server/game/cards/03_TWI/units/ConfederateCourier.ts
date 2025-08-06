import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ConfederateCourier extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3680942691',
            internalName: 'confederate-courier'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Create a Battle Droid token.',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid()
        });
    }
}
