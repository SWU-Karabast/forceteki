import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ColemanTreborJediRescuer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0571552412',
            internalName: 'coleman-trebor#jedi-rescuer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        // THIS IMPLEMENTATION IS NOT ACCURATE FOR TWIN SUNS
        registrar.addWhenPlayedAbility({
            title: 'Deal 1 damage to enemy base. If you do, heal 1 damage from your base',
            immediateEffect: abilityHelper.immediateEffects.damage((context) => ({ amount: 1, target: context.player.opponent.base })),
            ifYouDo: {
                title: 'Heal 1 damage from your base',
                immediateEffect: abilityHelper.immediateEffects.heal((context) => ({ amount: 1, target: context.player.base })),
            }
        });
    }
}