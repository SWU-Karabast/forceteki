import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';

export default class AdmiralPiettInCommandNow extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0274964861',
            internalName: 'admiral-piett#in-command-now',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'If you control a Aggression unit, draw a card',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ aspect: Aspect.Aggression }),
                onTrue: AbilityHelper.immediateEffects.draw()
            })
        });
    }
}