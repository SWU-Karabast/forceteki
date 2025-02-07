import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class ANewAdventure extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4717189843',
            internalName: 'a-new-adventure',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Return a non-leader unit that costs 6 or less to its owner\'s hand',
            targetResolver: {
                cardCondition: (card) => card.isNonLeaderUnit() && card.cost <= 6,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            then: (thenContext) => ({
                title: `Play ${thenContext.target.title} for free`,
                optional: true,
                canBeTriggeredBy: thenContext.source.controller !== thenContext.target.controller ? RelativePlayer.Opponent : RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    target: thenContext.target,
                    adjustCost: {
                        costAdjustType: CostAdjustType.Free
                    }
                })
            })
        });
    }
}

ANewAdventure.implemented = true;