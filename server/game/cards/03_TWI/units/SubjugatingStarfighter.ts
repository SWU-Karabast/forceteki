import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SubjugatingStarfighter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4824842849',
            internalName: 'subjugating-starfighter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Create a Battle Droid token',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasInitiative(),
                onTrue: AbilityHelper.immediateEffects.createBattleDroid(),
            })
        });
    }
}
