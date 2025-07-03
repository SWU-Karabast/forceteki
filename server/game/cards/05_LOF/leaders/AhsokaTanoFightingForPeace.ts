import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class AhsokaTanoFightingForPeace extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'ahsoka-tano#fighting-for-peace-id',
            internalName: 'ahsoka-tano#fighting-for-peace',
        };
    }

    protected override setupLeaderSideAbilities(card: this) {
        card.addActionAbility({
            title: 'Give a friendly unit Sentinel for this phase',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.useTheForce()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Sentinel })
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(card: this) {
        card.addOnAttackAbility({
            title: 'Give a friendly unit Sentinel for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Sentinel })
                })
            }
        });
    }
}
