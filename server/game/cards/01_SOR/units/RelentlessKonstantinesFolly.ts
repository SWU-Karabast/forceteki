import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { INonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, WildcardZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

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

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'The first event played by each opponent each round loses all abilities',
            ongoingEffect: AbilityHelper.ongoingEffects.blankEventCard(),
            targetZoneFilter: WildcardZoneName.Any,
            targetController: RelativePlayer.Opponent,
            targetCardTypeFilter: CardType.Event,
            matchTarget: (card, context) => this.isFirstEventPlayedByThisOpponentThisPhase(card, context)
        });
    }

    private isFirstEventPlayedByThisOpponentThisPhase(card: Card, context: AbilityContext<INonLeaderUnitCard>) {
        return card.controller !== context.source.controller &&
          card.type === CardType.Event &&
          !this.cardsPlayedThisPhaseWatcher.someCardPlayed((playedCardEntry) =>
              playedCardEntry.playedBy === card.controller &&
              playedCardEntry.card.type === CardType.Event &&
              playedCardEntry.card !== card
          );
    }
}
