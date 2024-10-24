import AbilityHelper from '../../../AbilityHelper';
import * as AbilityLimit from '../../../core/ability/AbilityLimit';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, Trait, WildcardCardType, WildcardLocation } from '../../../core/Constants';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class OmegaPartOfTheSquad extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '1386874723',
            internalName: 'omega#part-of-the-squad',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Ignore the aspect penalty on the first Clone unit you play each round',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: CardType.BasicUnit,
            targetLocationFilter: WildcardLocation.AnyArena,
            ongoingEffect: AbilityHelper.ongoingEffects.ignoreAllAspectPenalties({
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                match: (card) => card.hasSomeTrait(Trait.Clone),
                limit: AbilityLimit.perRound(1)
            }),
            matchTarget: (card) => this.isFirstClonePlayedByControllerThisPhase(card)
        });

        this.addWhenPlayedAbility({
            title: 'Search the top 5 cards of your deck for a Clone card, then reveal and draw it.',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 5,
                cardCondition: (card) => card.hasSomeTrait(Trait.Clone),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }

    private isFirstClonePlayedByControllerThisPhase(card) {
        const clonesPlayedByThisPlayerThisPhase = this.cardsPlayedThisPhaseWatcher.getCardsPlayed((playedCardEntry) =>
            playedCardEntry.playedBy === card.controller &&
            playedCardEntry.card.hasSomeTrait(Trait.Clone) &&
            playedCardEntry.card !== card);
        return clonesPlayedByThisPlayerThisPhase.some((card) => card.hasSomeTrait(Trait.Clone));
    }
}

OmegaPartOfTheSquad.implemented = true;
