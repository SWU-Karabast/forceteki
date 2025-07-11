import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class WookieeWarrior extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1477806735',
            internalName: 'wookiee-warrior'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Draw if you control an another Wookie unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.isTraitInPlay(Trait.Wookiee, context.source),
                onTrue: AbilityHelper.immediateEffects.draw(),
            })
        });
    }
}
