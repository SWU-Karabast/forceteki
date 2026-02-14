import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CantoBightSecurity extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'canto-bight-security-id',
            internalName: 'canto-bight-security',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnDefenseAbility({
            title: 'Credit a Credit token',
            immediateEffect: abilityHelper.immediateEffects.createCreditToken()
        });
    }
}