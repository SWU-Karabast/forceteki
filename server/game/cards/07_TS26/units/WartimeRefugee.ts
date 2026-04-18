import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class WartimeRefugee extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1577019857',
            internalName: 'wartime-refugee',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        // THIS IMPLEMENTATION IS NOT ACCURATE FOR TWIN SUNS
        registrar.addOnAttackAbility({
            title: 'Your opponent heals 1 damage from their base',
            immediateEffect: abilityHelper.immediateEffects.heal((context) => ({
                amount: 1,
                target: context.player.opponent.base,
            }))
        });
    }
}