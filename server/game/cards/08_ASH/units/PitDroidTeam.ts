import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { Card } from '../../../core/card/Card';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { TextHelper } from '../../../core/utils/TextHelper';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class PitDroidTeam extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '1178697110',
            internalName: 'pit-droid-team',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `The first upgrade you play on another friendly unit each phase costs ${TextHelper.resource(1)} less`,
            targetController: RelativePlayer.Self,
            targetZoneFilter: WildcardZoneName.AnyArena,
            ongoingEffect: AbilityHelper.ongoingEffects.decreaseCost({
                cardTypeFilter: WildcardCardType.Upgrade,
                amount: 1,
                match: (card, adjusterSource) => this.isFirstUpgradePlayedOnAnotherFriendlyUnitThisPhase(card, adjusterSource),
                attachTargetCondition: (attachTarget, context, adjusterSource) =>
                    attachTarget.controller === context.player &&
                    attachTarget !== adjusterSource,
            }),
        });
    }

    private isFirstUpgradePlayedOnAnotherFriendlyUnitThisPhase(card: Card, adjusterSource: Card) {
        return !this.cardsPlayedThisPhaseWatcher.someCardPlayed((playedCardEntry) =>
            playedCardEntry.playedBy === card.controller &&
            playedCardEntry.card.isUpgrade() &&
            playedCardEntry.parentCard?.controller === card.controller &&
            playedCardEntry.parentCard !== adjusterSource &&
            playedCardEntry.card !== card
        );
    }
}
