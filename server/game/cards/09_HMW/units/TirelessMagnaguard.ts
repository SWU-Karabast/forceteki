import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class TirelessMagnaguard extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1558034495',
            internalName: 'tireless-magnaguard',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'If this unit had 5 or more power, for this phase you may play this unit from your discard pile for free and give 2 Weakness tokens to it',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                // The unit goes to its owner's discard pile, so if it was defeated while an opponent controlled it
                // (e.g. No Glory, Only Results), it is not in "your" discard pile and the ability has no effect.
                condition: (context) => context.event.lastKnownInformation.power >= 5 && context.source.owner === context.player,
                onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.canPlayFromDiscard({
                        player: RelativePlayer.Self,
                        adjustCost: { costAdjustType: CostAdjustType.Free },
                        enterPlayEffect: AbilityHelper.immediateEffects.giveWeakness({ amount: 2 })
                    })
                })
            })
        });
    }
}
