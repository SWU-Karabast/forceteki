import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import type { Player } from '../../../core/Player';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { TextHelper } from '../../../core/utils/TextHelper';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class OriginTreeShyyyo extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'origin-tree-shyyyo-id',
            internalName: 'origin-tree-shyyyo',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control a ${TextHelper.Trait.Kashyyyk} base, the first, second, and third units you play each round cost ${TextHelper.resource(1)}, ${TextHelper.resource(2)}, and ${TextHelper.resource(3)} less, respectively`,
            condition: (context) => context.player.base.hasSomeTrait(Trait.Kashyyyk),
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: CardType.BasicUnit,
            targetZoneFilter: WildcardZoneName.AnyArena,
            ongoingEffect: AbilityHelper.ongoingEffects.decreaseCost({
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                match: (card) => this.getUnitsPlayedThisRoundCount(card.controller) < 3,
                amount: (card) => 1 + this.getUnitsPlayedThisRoundCount(card.controller)
            }),
        });
    }

    private getUnitsPlayedThisRoundCount(player: Player): number {
        return this.cardsPlayedThisPhaseWatcher.getCardsPlayed((playedCardEntry) =>
            playedCardEntry.playedAsType === CardType.BasicUnit &&
            playedCardEntry.playedBy === player
        ).length;
    }
}
