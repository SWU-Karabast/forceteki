import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class OmegaPartOfTheSquad extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '1386874723',
            internalName: 'omega#part-of-the-squad'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Ignore the aspect penalty on the first Clone unit you play each round',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: CardType.BasicUnit,
            targetZoneFilter: WildcardZoneName.AnyArena,
            ongoingEffect: AbilityHelper.ongoingEffects.ignoreAllAspectPenalties({
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                match: (card) => this.isFirstClonePlayedByControllerThisPhase(card),
                limit: AbilityHelper.AbilityLimit.perRound(1)
            }),
        });

        registrar.addWhenPlayedAbility({
            title: 'Search the top 5 cards of your deck for a Clone card, then reveal and draw it.',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 5,
                cardCondition: (card) => card.hasSomeTrait(Trait.Clone),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }

    private isFirstClonePlayedByControllerThisPhase(card) {
        return card.hasSomeTrait(Trait.Clone) && !this.cardsPlayedThisPhaseWatcher.someCardPlayed((playedCardEntry) =>
            playedCardEntry.playedBy === card.controller &&
            playedCardEntry.card.hasSomeTrait(Trait.Clone) &&
            playedCardEntry.card !== card
        );
    }
}
