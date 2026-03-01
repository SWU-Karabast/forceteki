import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction } from '../../../core/Constants';

export default class ShiftySuspects extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9994217631',
            internalName: 'shifty-suspects',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Bases can\'t be healed for this phase',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                effect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeHealed),
                target: [context.player.base, context.player.opponent.base],
            }))
        });
    }
}
