import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class StolenATHauler extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6272475624',
            internalName: 'stolen-athauler',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'For this phase, your opponent may play this unit from its owner\'s discard pile for free',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                effect: AbilityHelper.ongoingEffects.canPlayFromDiscard({
                    player: RelativePlayer.Opponent,
                    adjustCost: { costAdjustType: CostAdjustType.Free }
                })
            })
        });
    }
}