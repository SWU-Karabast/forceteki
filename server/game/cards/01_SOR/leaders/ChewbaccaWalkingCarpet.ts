import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer, ZoneName } from '../../../core/Constants';

export default class ChewbaccaWalkingCarpet extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3572356139',
            internalName: 'chewbacca#walking-carpet',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Play a unit that costs 3 or less. It gains sentinel for this phase',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.cost <= 3,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.playCardFromHand(),
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({ effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel) })
                ])
            }
        });
    }
}
