import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';

export default class VanguardAce extends NonLeaderUnitCard {
    private cardsPlayedThisWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '3018017739',
            internalName: 'vanguard-ace',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar) {
        this.cardsPlayedThisWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Give one experience for each other card you played this turn',
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => {
                const otherFriendlyCardsPlayedThisPhase = this.cardsPlayedThisWatcher.getCardsPlayed(
                    (cardPlay) =>
                        cardPlay.playedBy === context.source.controller &&
                        (cardPlay.card !== context.source || cardPlay.inPlayId !== context.source.inPlayId)
                );

                return { amount: otherFriendlyCardsPlayedThisPhase.length };
            })
        });
    }
}

VanguardAce.implemented = true;
