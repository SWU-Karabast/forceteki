import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { TextHelper } from '../../../core/utils/TextHelper';
import type { CardsPlayedThisRoundWatcher } from '../../../stateWatchers/CardsPlayedThisRoundWatcher';

export default class DirectorKrennicOnTheVergeOfGreatness extends NonLeaderUnitCard {
    private cardsPlayedThisRoundWatcher: CardsPlayedThisRoundWatcher;

    protected override getImplementationId () {
        return {
            id: '6311662442',
            internalName: 'director-krennic#on-the-verge-of-greatness',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisRoundWatcher = AbilityHelper.stateWatchers.cardsPlayedThisRound();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `The first unit you play each round that has a "When Defeated" ability costs ${TextHelper.resource(1)} less`,
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: CardType.BasicUnit,
            targetZoneFilter: WildcardZoneName.AnyArena,
            ongoingEffect: AbilityHelper.ongoingEffects.decreaseCost({
                amount: 1,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                match: (card) => this.isFirstUnitWithWhenDefeatedPlayedThisPhase(card)
            }),
        });
    }

    private isFirstUnitWithWhenDefeatedPlayedThisPhase(card) {
        return card.isUnit() &&
          card.getTriggeredAbilities().some((ability) => ability.isWhenDefeated) &&
          !this.cardsPlayedThisRoundWatcher.someCardPlayed((playedCardEntry) =>
              playedCardEntry.playedAsType === CardType.BasicUnit &&
              playedCardEntry.playedBy === card.controller &&
              playedCardEntry.hasWhenDefeatedAbilities
          );
    }
}
