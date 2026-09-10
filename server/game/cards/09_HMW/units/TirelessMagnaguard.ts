import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Duration, ZoneName } from '../../../core/Constants';

export default class TirelessMagnaguard extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'tireless-magnaguard-id',
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
                onTrue: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                        effect: AbilityHelper.ongoingEffects.canPlayFromDiscard({ player: context.player })
                    })),
                    AbilityHelper.immediateEffects.forThisPhasePlayerEffect((context) => ({
                        target: context.player,
                        effect: AbilityHelper.ongoingEffects.forFree({
                            match: (card) => card === context.source && card.zoneName === ZoneName.Discard
                        })
                    })),
                    AbilityHelper.immediateEffects.delayedPlayerEffect((context) => ({
                        title: 'Give 2 Weakness tokens to Tireless Magnaguard',
                        target: context.player,
                        duration: Duration.UntilEndOfPhase,
                        effectDescription: 'give 2 Weakness tokens to Tireless Magnaguard when it is played from their discard pile this phase',
                        when: {
                            onCardPlayed: (event, delayedContext) =>
                                event.card === delayedContext.source &&
                                event.player === delayedContext.player &&
                                event.originalZone === ZoneName.Discard
                        },
                        immediateEffect: AbilityHelper.immediateEffects.giveWeakness((delayedContext) => ({
                            amount: 2,
                            target: delayedContext.source
                        }))
                    }))
                ])
            })
        });
    }
}
