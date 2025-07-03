import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { ResolutionMode } from '../../../gameSystems/SimultaneousOrSequentialSystem';

export default class ChewbaccaWalkingCarpet extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3572356139',
            internalName: 'chewbacca#walking-carpet',
        };
    }

    protected override setupLeaderSideAbilities(card: this) {
        card.addActionAbility({
            title: 'Play a unit that costs 3 or less. It gains sentinel for this phase',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.cost <= 3,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous({
                    gameSystems: [
                        AbilityHelper.immediateEffects.playCardFromHand({ playAsType: WildcardCardType.Unit }),
                        AbilityHelper.immediateEffects.forThisPhaseCardEffect({ effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel) })
                    ],
                    resolutionMode: ResolutionMode.AllGameSystemsMustBeLegal,
                }),
            }
        });
    }
}
