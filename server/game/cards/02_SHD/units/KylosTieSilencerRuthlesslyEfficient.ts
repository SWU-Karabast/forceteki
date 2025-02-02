import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDiscardedThisPhaseWatcher } from '../../../stateWatchers/CardsDiscardedThisPhaseWatcher';

export default class KylosTieSilencerRuthlesslyEfficient extends NonLeaderUnitCard {
    private cardsDiscardedThisPhaseWatcher: CardsDiscardedThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: '3991112153',
            internalName: 'kylos-tie-silencer#ruthlessly-efficient'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsDiscardedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDiscardedThisPhase(registrar, this);
    }

    public override setupCardAbilities () {
        this.addActionAbility({
            title: 'Play Kylo\'s TIE Silencer from your discard pile',
            condition: (context) => this.cardsDiscardedThisPhaseWatcher.getCurrentValue().some((entry) =>
                entry.discardedFromPlayer === context.source.controller &&
                entry.card === context.source &&
                entry.discardedPlayId === context.source.mostRecentInPlayId &&
                [ZoneName.Hand, ZoneName.Deck].includes(entry.discardedFromZone)
            ),
            immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay(),
            zoneFilter: ZoneName.Discard
        });
    }
}
