import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class SawGerreraResistanceIsNotTerrorism extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0354710662',
            internalName: 'saw-gerrera#resistance-is-not-terrorism',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'If your base has 15 or more damage on it, deal 1 damage to each enemy ground unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.base.damage >= 15,
                onTrue: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: 1,
                    target: context.player.opponent.getArenaUnits({ arena: ZoneName.GroundArena })
                }))
            })
        });
    }
}
