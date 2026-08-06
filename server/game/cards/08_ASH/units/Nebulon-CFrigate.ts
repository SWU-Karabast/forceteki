import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class NebulonCFrigate extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0656766123',
            internalName: 'nebulonc-frigate',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Heal 3 damage from a unit or base',
            optional: true,
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 3 })
            }
        });
    }
}