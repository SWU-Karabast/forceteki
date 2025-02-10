import AbilityHelper from '../../../AbilityHelper';
import * as Helpers from '../../../core/utils/Helpers';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { IThenAbilityPropsWithSystems } from '../../../Interfaces';

export default class EndlessLegions extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5576996578',
            internalName: 'endless-legions',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Reveal any number of resources you control',
            targetResolver: {
                mode: TargetMode.Unlimited,
                zoneFilter: ZoneName.Resource,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.reveal(),
            },
            then: (context) => this.playRevealedCard([], context),
        });
    }

    private playRevealedCard(playedCards: Card[], revealedCardsContext: AbilityContext): IThenAbilityPropsWithSystems<AbilityContext> {
        return {
            title: 'Play a revelead unit for free',
            targetResolver: {
                activePromptTitle: 'Choose a unit to play for free',
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.Resource,
                controller: RelativePlayer.Self,
                ignoreHiddenZoneRule: false,
                cardCondition: (card: Card) => Helpers.asArray(revealedCardsContext.target).includes(card) && !playedCards.includes(card),
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                    adjustCost: { costAdjustType: CostAdjustType.Free },
                    canPlayFromAnyZone: true,
                    nested: true,
                })
            },
            then: (context) => this.playRevealedCard([...playedCards, context.target], revealedCardsContext),
        };
    }
}
