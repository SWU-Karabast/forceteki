import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, WildcardZoneName } from '../../../core/Constants';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class RelentlessKonstantinesFolly extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '3401690666',
            internalName: 'relentless#konstantines-folly'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'The first event played by each opponent each round loses all abilities',
            ongoingEffect: AbilityHelper.ongoingEffects.blankEventCard(),
            targetZoneFilter: WildcardZoneName.Any,
            targetController: RelativePlayer.Opponent,
            targetCardTypeFilter: CardType.Event,
            matchTarget: (card) => this.isFirstEventPlayedByThisOpponentThisPhase(card)
        });
    }

    private isFirstEventPlayedByThisOpponentThisPhase(card) {
        const eventsPlayedByThatPlayerThisPhase = this.cardsPlayedThisPhaseWatcher.getCardsPlayed((playedCardEntry) =>
            playedCardEntry.playedBy === card.controller &&
            playedCardEntry.card.type === CardType.Event &&
            playedCardEntry.card !== card);
        return eventsPlayedByThatPlayerThisPhase.length === 0 && card.controller !== this.controller && card.type === CardType.Event;
    }
}

RelentlessKonstantinesFolly.implemented = true;
