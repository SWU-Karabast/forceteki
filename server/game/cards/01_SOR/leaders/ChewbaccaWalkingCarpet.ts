import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, Location } from '../../../core/Constants';

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
                locationFilter: Location.Hand,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.playCard(),
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({ effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel) })
                ])
            }
        });
    }
}

ChewbaccaWalkingCarpet.implemented = true;
