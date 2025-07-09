import AbilityHelper from '../../../AbilityHelper';
import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { CardType, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class DeathStarPlans extends UpgradeCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;
    protected override getImplementationId() {
        return {
            id: '7501988286',
            internalName: 'death-star-plans',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'The attacking player takes control of this upgrade and attaches it to a unit they control',
            when: {
                onAttackDeclared: (event, context) => context.source.isAttached() && event.attack.getAllTargets().includes(context.source.parentCard),
            },
            targetResolver: {
                choosingPlayer: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                    newController: RelativePlayer.Opponent,
                    upgrade: context.source,
                    target: context.target,
                }))
            }
        });

        registrar.addGainConstantAbilityTargetingAttached({
            title: 'The first unit you play each round costs 2 less',
            ongoingEffect: AbilityHelper.ongoingEffects.decreaseCost({
                amount: 2,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                match: (card) => this.isFirstUnitPlayedThisPhase(card)
            }),
        });
    }

    private isFirstUnitPlayedThisPhase(card) {
        return card.isUnit() &&
          !this.cardsPlayedThisPhaseWatcher.someCardPlayed((playedCardEntry) =>
              playedCardEntry.playedAsType === CardType.BasicUnit &&
              playedCardEntry.playedBy === card.controller
          );
    }
}
