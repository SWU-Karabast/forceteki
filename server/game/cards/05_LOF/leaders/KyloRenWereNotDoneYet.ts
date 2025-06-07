import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, EventName, GameStateChangeRequired, RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class KyloRenWereNotDoneYet extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5174764156',
            internalName: 'kylo-ren#were-not-done-yet',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Discard a card from your hand. If you discard an Upgrade this way, draw a card',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                    target: context.player,
                    amount: 1
                })),
                AbilityHelper.immediateEffects.conditional((context) => ({
                    condition: context.events.some(
                        (event) => event.name === EventName.OnCardDiscarded && event.card.isUpgrade()
                    ),
                    onTrue: AbilityHelper.immediateEffects.draw(),
                }))
            ])
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'Play any number of Upgrades from your discard pile on this unit',
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            targetResolver: {
                canChooseNoCards: true,
                cardTypeFilter: CardType.BasicUpgrade,
                mode: TargetMode.Unlimited,
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                mustChangeGameState: GameStateChangeRequired.MustFullyResolve,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay((context) => ({
                    playAsType: WildcardCardType.Upgrade,
                    canPlayFromAnyZone: true,
                    nested: true,
                    attachTargetCondition: (attachTarget) => attachTarget === context.source
                }))
            }
        });
    }
}