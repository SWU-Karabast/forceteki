import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class RenownedDignitaries extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'renowned-dignitaries-id',
            internalName: 'renowned-dignitaries',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Heal 2 damage from your base for each friendly Official unit',
            immediateEffect: abilityHelper.immediateEffects.heal((context) => ({
                target: context.player.base,
                amount: 2 * context.player.getArenaUnits({ trait: Trait.Official }).length,
            })),
        });
    }
}
