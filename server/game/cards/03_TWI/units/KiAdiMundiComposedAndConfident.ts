import { log } from 'console';
import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class KiAdiMundiComposedAndConfident extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7200475001',
            internalName: 'kiadimundi#composed-and-confident',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addCoordinateAbility({
            title: 'Draw 2 cards',
            type: AbilityType.Triggered,
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 2 }),
            when: {
                onCardPlayed: (context, card) => this.isSecondCardPlayedByOpponentThisPhase(context, card)
            }
        });
    }

    private isSecondCardPlayedByOpponentThisPhase(context, card) {
        return card.controller !== this.controller && this.cardsPlayedThisPhaseWatcher.getCardsPlayed((playedCardEntry) =>
            playedCardEntry.playedBy === this.controller.opponent).length === 2;
    }
}

KiAdiMundiComposedAndConfident.implemented = true;
