import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisRoundWatcher } from '../../../stateWatchers/CardsPlayedThisRoundWatcher';
import type { Player } from '../../../core/Player';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TheMasterCodebreakerHighStakes extends NonLeaderUnitCard {
    private cardsPlayedThisRoundWatcher: CardsPlayedThisRoundWatcher;

    protected override getImplementationId () {
        return {
            id: '4763371184',
            internalName: 'the-master-codebreaker#high-stakes'
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisRoundWatcher = abilityHelper.stateWatchers.cardsPlayedThisRound();
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `The first ${TextHelper.Trait.Gambit} card you play each round costs ${TextHelper.resource(1)} less`,
            ongoingEffect: abilityHelper.ongoingEffects.decreaseCost({
                amount: 1,
                match: (card, source) => card.hasSomeTrait(Trait.Gambit) && this.isFirstGambitYouPlayedThisPhase(source.controller)
            })
        });

        registrar.addWhenPlayedAbility({
            title: `Search the top 8 cards of your deck for a ${TextHelper.Trait.Gambit} card, reveal it, and draw it`,
            immediateEffect: abilityHelper.immediateEffects.deckSearch({
                searchCount: 8,
                cardCondition: (card) => card.hasSomeTrait(Trait.Gambit),
                selectedCardsImmediateEffect: abilityHelper.immediateEffects.revealAndDraw({
                    useDisplayPrompt: true,
                    promptedPlayer: RelativePlayer.Opponent
                })
            })
        });
    }

    private isFirstGambitYouPlayedThisPhase (player: Player): boolean {
        return !this.cardsPlayedThisRoundWatcher.someCardPlayed((playedCardEntry) =>
            playedCardEntry.card.hasSomeTrait(Trait.Gambit) && playedCardEntry.playedBy === player
        );
    }
}