import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class MylayaRider extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6717068953',
            internalName: 'mylaya-rider'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create a Beast token and heal 2 damage from your base',
            immediateEffect: abilityHelper.immediateEffects.simultaneous([
                abilityHelper.immediateEffects.createBeast((context) => ({ target: context.player })),
                abilityHelper.immediateEffects.heal((context) => ({ amount: 2, target: context.player.base }))
            ])
        });
    }
}
