import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CoruscantDissident extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9115773123',
            internalName: 'coruscant-dissident'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Ready a resource',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.readyResources((context) => ({
                target: context.player,
                amount: 1
            }))
        });
    }
}
