import AbilityHelper from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, EventName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import type { IThenAbilityPropsWithSystems } from '../../../Interfaces';

export default class KyloRenWereNotDoneYet extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5174764156',
            internalName: 'kylo-ren#were-not-done-yet',
        };
    }

    protected override setupLeaderSideAbilities(card: this) {
        card.addActionAbility({
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

    protected override setupLeaderUnitSideAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Play any number of Upgrades from your discard pile on this unit',
            optional: true,
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            targetResolver: {
                cardTypeFilter: CardType.BasicUpgrade,
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay((context) => ({
                    playAsType: WildcardCardType.Upgrade,
                    canPlayFromAnyZone: true,
                    attachTargetCondition: (attachTarget) => attachTarget === context.source
                }))
            },
            then: () => this.thenPlayAnotherUpgrade()
        });
    }

    private thenPlayAnotherUpgrade(): IThenAbilityPropsWithSystems<TriggeredAbilityContext<this>> {
        return {
            title: 'Play another Upgrade from your discard pile on this unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: CardType.BasicUpgrade,
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay((context) => ({
                    playAsType: WildcardCardType.Upgrade,
                    canPlayFromAnyZone: true,
                    attachTargetCondition: (attachTarget) => attachTarget === context.source
                }))
            },
            then: () => this.thenPlayAnotherUpgrade()
        };
    }
}