import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ImperialDoorTechnician extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'imperial-door-technician-id',
            internalName: 'imperial-door-technician',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Heal 2 damage from your base',
            immediateEffect: abilityHelper.immediateEffects.heal((context) => ({ amount: 2, target: context.player.base }))
        });
    }
}