import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class TauntaunMount extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2798571364',
            internalName: 'tauntaun-mount',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Heal 2 damage from your base',
            immediateEffect: abilityHelper.immediateEffects.heal((context) => ({ amount: 2, target: context.player.base }))
        });
    }
}