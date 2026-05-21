import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BankJobFugitives extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6438727942',
            internalName: 'bank-job-fugitives',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create a Credit token',
            immediateEffect: abilityHelper.immediateEffects.createCreditToken()
        });
    }
}