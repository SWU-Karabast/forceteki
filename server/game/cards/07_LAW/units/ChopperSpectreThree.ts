import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';

export default class ChopperSpectreThree extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'chopper#spectre-three-id',
            internalName: 'chopper#spectre-three',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give an experience token to this unit. If you control a Cunning or Vigilance unit, give two experience tokens to him instead',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.isAspectInPlay(Aspect.Cunning, context.source) || context.player.isAspectInPlay(Aspect.Vigilance, context.source),
                onTrue: AbilityHelper.immediateEffects.giveExperience({ amount: 2 }),
                onFalse: AbilityHelper.immediateEffects.giveExperience()
            }),
        });
    }
}