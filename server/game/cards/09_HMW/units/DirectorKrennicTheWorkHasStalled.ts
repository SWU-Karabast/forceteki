import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class DirectorKrennicTheWorkHasStalled extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'director-krennic#the-work-has-stalled-id',
            internalName: 'director-krennic#the-work-has-stalled',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Draw a card',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.base.upgrades.length > 0,
                onTrue: abilityHelper.immediateEffects.draw((context) => ({ target: context.player }))
            })
        });
    }
}