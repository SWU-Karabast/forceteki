import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
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

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addCoordinateAbility({
            title: 'Draw 2 cards',
            type: AbilityType.Triggered,
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 2 }),
            when: {
                onCardPlayed: (event, context) => this.isSecondCardPlayedByOpponentThisPhase(event, context)
            }
        });
    }

    private isSecondCardPlayedByOpponentThisPhase(event, context) {
        if (event.player === context.source.controller) {
            return false;
        }
        const cardsPlayedByOpponent = this.cardsPlayedThisPhaseWatcher.getCardsPlayed((playedCardEntry) =>
            playedCardEntry.playedBy === event.player && playedCardEntry.playEvent !== event);
        const amountCardsPlayedByOpponent = cardsPlayedByOpponent.length + 1;
        return amountCardsPlayedByOpponent === 2;
    }
}

