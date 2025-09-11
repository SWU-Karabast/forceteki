import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SynaraSanHarboringASecret extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'synara-san#harboring-a-secret-id',
            internalName: 'synara-san#harboring-a-secret',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'For each friendly unit, ready a friendly resource',
            immediateEffect: abilityHelper.immediateEffects.readyResources((context) => ({ amount: context.player.getArenaUnits().length }))
        });
    }
}
