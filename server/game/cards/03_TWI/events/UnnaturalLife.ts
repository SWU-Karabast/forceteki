import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { PhaseName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class UnnaturalLife extends EventCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4113123883',
            internalName: 'unnatural-life'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Play a unit that was defeated this phase from your discard pile. It costs 2 less and enters play ready.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card.isUnit() && this.unitsDefeatedThisPhaseWatcher.wasDefeatedThisPhase(card),
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    entersReady: true,
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 2 }
                }),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'At the start of your regroup phase, defeat it.',
                immediateEffect: AbilityHelper.immediateEffects.delayedCardEffect({
                    title: 'Defeat it.',
                    target: ifYouDoContext.events[0].card,
                    when: {
                        onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                    },
                    immediateEffect: AbilityHelper.immediateEffects.defeat()
                })
            })
        });
    }
}
