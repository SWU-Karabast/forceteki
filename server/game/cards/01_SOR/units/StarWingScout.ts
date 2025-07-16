import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class StarWingScout extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7517208605',
            internalName: 'star-wing-scout'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenDefeatedAbility({
            title: 'Draw 2 cards',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                // context.player is always the player resolving the ability
                condition: (context) => context.player.hasInitiative(),
                onTrue: AbilityHelper.immediateEffects.draw({ amount: 2 }),
            })
        });
    }
}
