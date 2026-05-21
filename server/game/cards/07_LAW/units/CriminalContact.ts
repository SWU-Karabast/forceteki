import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class CriminalContact extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6530952637',
            internalName: 'criminal-contact'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: `Pay ${TextHelper.resource(2)} to create a Credit token`,
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.payResources((context) => ({ amount: 2, target: context.player })),
            ifYouDo: {
                title: 'Create a Credit token',
                immediateEffect: abilityHelper.immediateEffects.createCreditToken()
            }
        });
    }
}