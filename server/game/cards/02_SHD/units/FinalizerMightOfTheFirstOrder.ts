import AbilityHelper from '../../../AbilityHelper';
import * as Helpers from '../../../core/utils/Helpers.js';
import { Card } from '../../../core/card/Card';
import { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType, WildcardZoneName, ZoneName } from '../../../core/Constants';

export default class FinalizerMightOfTheFirstOrder extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9752523457',
            internalName: 'finalizer#might-of-the-first-order',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Choose any number of friendly units',
            targetResolver: {
                activePromptTitle: 'Choose friendly units that will capture enemy units in the same arena',
                mode: TargetMode.UpToVariable,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: RelativePlayer.Self,
                canChooseNoCards: true,
                numCardsFunc: (context) => Math.min(
                    context.source.controller.getUnitsInPlay().length,
                    this.countOpponentNonLeaderUnitsInPlay(context, WildcardZoneName.AnyArena)
                ),
                multiSelectCardCondition: (card, selectedCards, context) => this.countOpponentNonLeaderUnitsInPlay(context, card.zoneName) > this.countSelectedCardsInZone(selectedCards, card.zoneName),
            },
            then: (chosenUnitsContext) => ({
                title: 'Each of those units captures an enemy non-leader unit in the same arena',
                immediateEffect: AbilityHelper.immediateEffects.sequential(
                    Helpers.asArray(chosenUnitsContext.target).map((target) =>
                        AbilityHelper.immediateEffects.selectCard({
                            activePromptTitle: `Choose a unit to capture with ${target.title}`,
                            player: RelativePlayer.Self,
                            cardTypeFilter: WildcardCardType.NonLeaderUnit,
                            zoneFilter: target.zoneName,
                            controller: RelativePlayer.Opponent,
                            innerSystem: AbilityHelper.immediateEffects.capture({ captor: target })
                        })
                    )
                )
            })
        });
    }

    private countOpponentNonLeaderUnitsInPlay(context: TriggeredAbilityContext, zoneName: ZoneName | WildcardZoneName.AnyArena): number {
        return context.source.controller.opponent.getUnitsInPlay(
            zoneName as ZoneName.GroundArena | ZoneName.SpaceArena | WildcardZoneName.AnyArena,
            (card) => card.isNonLeaderUnit()
        ).length;
    }

    private countSelectedCardsInZone(selectedCards: Card[], zoneName: ZoneName): number {
        return selectedCards.filter((selectedCard) => selectedCard.zoneName === zoneName).length;
    }
}

FinalizerMightOfTheFirstOrder.implemented = true;
