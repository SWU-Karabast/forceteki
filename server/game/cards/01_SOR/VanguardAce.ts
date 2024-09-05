import AbilityHelper from '../../AbilityHelper';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { CardsPlayedThisPhaseWatcher } from '../../core/stateWatcher/CardsPlayedThisPhaseWatcher';
import { StateWatcherRegistrar } from '../../core/stateWatcher/StateWatcherRegistrar';

export default class VanguardAce extends NonLeaderUnitCard {
    private cardsPlayedThisWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '3018017739',
            internalName: 'vanguard-ace',
        };
    }

    protected override setupStateWatchers(stateWatcherRegistrar: StateWatcherRegistrar) {
        this.cardsPlayedThisWatcher = new CardsPlayedThisPhaseWatcher(stateWatcherRegistrar, this);
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Give one experience for each card you played this turn',
            immediateEffect: AbilityHelper.immediateEffects.giveExperience(() => {
                const cardsPlayedThisPhase = this.cardsPlayedThisWatcher.getCurrentValue();

                const experienceCount = cardsPlayedThisPhase.filter((playedCardEntry) =>
                    playedCardEntry.playedBy === this.controller &&
                    playedCardEntry.card !== this
                ).length;

                return { amount: experienceCount };
            })
        });
    }
}

VanguardAce.implemented = true;
