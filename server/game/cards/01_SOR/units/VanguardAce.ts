import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
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

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper) {
        this.cardsPlayedThisWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give one experience for each other card you played this turn',
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => {
                const otherFriendlyCardsPlayedThisPhase = this.cardsPlayedThisWatcher.getCardsPlayed(
                    (cardPlay) =>
                        cardPlay.playedBy === context.player &&
                        (cardPlay.card !== context.source || cardPlay.inPlayId !== context.source.inPlayId)
                );

                return { amount: otherFriendlyCardsPlayedThisPhase.length };
            })
        });
    }
}
