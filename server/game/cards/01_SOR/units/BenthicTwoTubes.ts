import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName, RelativePlayer } from '../../../core/Constants';

export default class BenthicTwoTubes extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0256267292',
            internalName: 'benthic-two-tubes#partisan-lieutenant',
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'Give Raid 2 to a friendly Aggression unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card !== context.source && card.isUnit() && card.hasSomeAspect(Aspect.Aggression),
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
                }),
            }
        });
    }
}

BenthicTwoTubes.implemented = true;
