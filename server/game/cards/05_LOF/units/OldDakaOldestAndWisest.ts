import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class OldDakaOldestAndWisest extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'old-daka#oldest-and-wisest-id',
            internalName: 'old-daka#oldest-and-wisest',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Defeat a friendly Night unit not named Old Daka',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, _context) => card.hasSomeTrait(Trait.Night) && card.title !== 'Old Daka',
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            then: (thenContext) => ({
                title: `Play ${thenContext.events[0].card.title} from your discard pile for free`,
                optional: true,
                thenCondition: (context) =>
                    thenContext.events[0].card.zone === context.player.discardZone,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                    target: thenContext.events[0].card,
                    playAsType: WildcardCardType.Unit,
                    adjustCost: { costAdjustType: CostAdjustType.Free }
                })
            })
        });
    }
}

