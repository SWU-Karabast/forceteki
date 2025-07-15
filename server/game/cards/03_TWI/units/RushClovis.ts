import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RushClovis extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9964112400',
            internalName: 'rush-clovis#banking-clan-scion'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'Create a Battle Droid token.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.opponent.readyResourceCount === 0,
                onTrue: AbilityHelper.immediateEffects.createBattleDroid(),
            })
        });
    }
}
