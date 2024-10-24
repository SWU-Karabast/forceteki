import AbilityHelper from '../../../AbilityHelper';
import * as AbilityLimit from '../../../core/ability/AbilityLimit';
import { Card } from '../../../core/card/Card';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, Trait, WildcardCardType, WildcardLocation } from '../../../core/Constants';
import Player from '../../../core/Player';
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
            playedCardEntry.card !== card
        );
        const cards = this.cardsPlayedThisPhaseWatcher.getCurrentValue();
        if (cards.length > 0) {
            console.log('Card is -> ', cards[0].card.title);
            console.log('Condition 1-> ', cards[0].playedBy === card.controller);
            console.log('Condition 2-> ', cards[0].card.hasSomeTrait(Trait.Clone));
            console.log('Condition 3-> ', cards[0].card !== card);
        }
        return clonesPlayedByThisPlayerThisPhase.length === 0;
    }
}

OmegaPartOfTheSquad.implemented = true;
