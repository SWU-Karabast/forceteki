import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DedraMeeroWithVerifiableData extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8167114067',
            internalName: 'dedra-meero#with-verifiable-data',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Create a Spy token',
            immediateEffect: abilityHelper.immediateEffects.createSpy(),
        });
    }
}
