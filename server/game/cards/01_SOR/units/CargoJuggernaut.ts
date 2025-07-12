import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';

export default class CargoJuggernaut extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9459170449',
            internalName: 'cargo-juggernaut'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'If you control another Vigilance unit, heal 4 damage from your base',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ otherThan: context.source, aspect: Aspect.Vigilance }),
                onTrue: AbilityHelper.immediateEffects.heal((context) => ({ amount: 4, target: context.player.base })),
            })
        });
    }
}
