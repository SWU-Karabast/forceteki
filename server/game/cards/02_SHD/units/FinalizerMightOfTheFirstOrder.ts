import AbilityHelper from '../../../AbilityHelper';
import * as Contract from '../../../core/utils/Contract';
import * as Helpers from '../../../core/utils/Helpers.js';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';
import type { Card } from '../../../core/card/Card';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { ZoneName } from '../../../core/Constants';
import { EventName, RelativePlayer, TargetMode, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class FinalizerMightOfTheFirstOrder extends NonLeaderUnitCard {
    protected override readonly overrideNotImplemented: boolean = true;

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
                immediateEffect: AbilityHelper.immediateEffects.simultaneous(
                    Helpers.asArray(chosenUnitsContext.target).map((target) =>
                        AbilityHelper.immediateEffects.selectCard({
                            activePromptTitle: `Choose a unit to capture with ${target.title}`,
                            player: RelativePlayer.Self,
                            cardTypeFilter: WildcardCardType.NonLeaderUnit,
                            zoneFilter: target.zoneName,
                            controller: RelativePlayer.Opponent,
                            cardCondition: (card, context) => !this.capturedCardsFromContext(context).has(card),
                            innerSystem: AbilityHelper.immediateEffects.capture({ captor: target })
                        })
                    )
                )
            })
        });
    }

    private countOpponentNonLeaderUnitsInPlay(context: AbilityContext, zoneName: ZoneName | WildcardZoneName.AnyArena): number {
        Contract.assertTrue(EnumHelpers.isArena(zoneName), `Zone ${zoneName} must be an arena`);
        return context.source.controller.opponent.getUnitsInPlay(
            zoneName,
            (card) => card.isNonLeaderUnit()
        ).length;
    }

    private countSelectedCardsInZone(selectedCards: Card[], zoneName: ZoneName): number {
        return selectedCards.filter((selectedCard) => selectedCard.zoneName === zoneName).length;
    }

    private capturedCardsFromContext(context: AbilityContext): Set<Card> {
        return new Set(context.events.filter((event) => event.name === EventName.OnCardCaptured).map((event) => event.card));
    }
}
