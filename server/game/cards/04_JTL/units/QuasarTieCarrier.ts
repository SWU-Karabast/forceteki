import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class QuasarTieCarrier extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2657417747',
            internalName: 'quasar-tie-carrier',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Create a TIE Fighter token',
            immediateEffect: AbilityHelper.immediateEffects.createTieFighter()
        });
    }
}
