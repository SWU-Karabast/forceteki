import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

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
                onCardPlayed: (event) => this.isSecondCardPlayedByOpponentThisPhase(event)
            }
        });
    }

    private isSecondCardPlayedByOpponentThisPhase(event) {
        if (event.card.controller === this.controller) {
            return false;
        }
        const cardsPlayedByOpponent = this.cardsPlayedThisPhaseWatcher.getCardsPlayed((playedCardEntry) =>
            playedCardEntry.playedBy === this.controller.opponent && playedCardEntry.playEvent !== event);
        const amountCardsPlayedByOpponent = cardsPlayedByOpponent.length + 1;
        return amountCardsPlayedByOpponent === 2;
    }
}

