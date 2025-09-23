import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, WildcardZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';
import type { Card } from '../../../core/card/Card';

export default class CongressOfMalastare extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: 'congress-of-malastare-id',
            internalName: 'congress-of-malastare',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'The first Upgrade you play each phase costs 1 resource less',
            targetController: RelativePlayer.Self,
            targetZoneFilter: WildcardZoneName.AnyArena,
            ongoingEffect: abilityHelper.ongoingEffects.decreaseCost({
                cardTypeFilter: [CardType.BasicUpgrade, CardType.NonLeaderUnitUpgrade],
                match: (card) => this.isFirstUpgradePlayedByControllerThisPhase(card),
                amount: 1,
                limit: abilityHelper.limit.perRound(1)
            }),
        });
    }

    private isFirstUpgradePlayedByControllerThisPhase (card: Card) {
        return !this.cardsPlayedThisPhaseWatcher.someCardPlayed((playedCardEntry) =>
            playedCardEntry.playedBy === card.controller &&
            (playedCardEntry.playedAsType === CardType.BasicUpgrade || playedCardEntry.playedAsType === CardType.NonLeaderUnitUpgrade) &&
            playedCardEntry.card !== card);
    }
}