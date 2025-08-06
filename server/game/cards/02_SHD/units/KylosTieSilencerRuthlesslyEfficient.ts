import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';
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

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsDiscardedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDiscardedThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play Kylo\'s TIE Silencer from your discard pile',
            condition: (context) => this.cardsDiscardedThisPhaseWatcher.getCurrentValue().some((entry) =>
                entry.discardedFromPlayer === context.player &&
                entry.card === context.source &&
                entry.discardedPlayId === context.source.mostRecentInPlayId &&
                [ZoneName.Hand, ZoneName.Deck].includes(entry.discardedFromZone)
            ),
            immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({ playAsType: WildcardCardType.Unit }),
            zoneFilter: ZoneName.Discard
        });
    }
}
