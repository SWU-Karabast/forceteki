import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

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
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    effect: AbilityHelper.ongoingEffects.canPlayFromDiscard({ player: context.player.opponent })
                })),
                AbilityHelper.immediateEffects.forThisPhasePlayerEffect((context) => ({
                    target: context.player.opponent,
                    effect: AbilityHelper.ongoingEffects.forFree({
                        match: (card) => card === context.source
                    })
                }))
            ])
        });
    }
}