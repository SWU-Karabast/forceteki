import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Duration, PhaseName } from '../../../core/Constants';

export default class ZoriiBlissValiantSmuggler extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2522489681',
            internalName: 'zorii-bliss#valiant-smuggler'
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'Draw a card. At the start of the regroup phase, discard a card from your hand',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.draw(),
                AbilityHelper.immediateEffects.delayedEffect({
                    when: {
                        onPhaseStarted: (context) => context.phase === PhaseName.Regroup,
                    },
                    duration: Duration.UntilEndOfRound,
                    immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                        amount: 1,
                        target: context.source.controller
                    }))
                })
                // TODO remove before final merge
                // AbilityHelper.immediateEffects.playerLastingEffect({
                //     duration: Duration.UntilEndOfRound,
                //     targetPlayer: RelativePlayer.Self,
                //     effect: AbilityHelper.ongoingEffects.delayedEffect({
                //         title: 'Discard a card from your hand',
                //         when: {
                //             onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                //         },
                //         immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                //             amount: 1,
                //             target: context.source.controller
                //         }))
                //     })
                // })
            ])
        });
    }
}

ZoriiBlissValiantSmuggler.implemented = true;
