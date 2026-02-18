import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CriminalContact extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'criminal-contact-id',
            internalName: 'criminal-contact'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Pay 2 resource to create a Credit token',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.payResources((context) => ({ amount: 2, target: context.player })),
            ifYouDo: {
                title: 'Create a Credit token',
                immediateEffect: abilityHelper.immediateEffects.createCreditToken()
            }
        });
    }
}