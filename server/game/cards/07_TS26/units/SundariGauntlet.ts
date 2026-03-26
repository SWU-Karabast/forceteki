import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SundariGauntlet extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'sundari-gauntlet-id',
            internalName: 'sundari-gauntlet',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnDefenseAbility({
            title: 'Deal 1 damage to your base',
            immediateEffect: abilityHelper.immediateEffects.damage((context) => ({ amount: 1, target: context.player.base }))
        });
    }
}