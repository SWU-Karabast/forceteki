import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BoKatanKryzeFightingForMandalore extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9637610169',
            internalName: 'bokatan-kryze#fighting-for-mandalore'
        };
    }

    /* When defeated, checks completed on both bases to see if base damage is higher than 15.
     if it is, player draws a card */

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'For each player with 15 or more damage on their base, draw a card.',
            // simultaneous condition check of base damage
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.conditional({
                    // player base damage check
                    condition: (context) => context.player.base.damage >= 15,
                    onTrue: AbilityHelper.immediateEffects.draw(),
                }),
                AbilityHelper.immediateEffects.conditional({
                    // Opponent base damage check
                    condition: (context) => context.player.opponent.base.damage >= 15,
                    onTrue: AbilityHelper.immediateEffects.draw(),
                }),
            ]),
        });
    }
}
