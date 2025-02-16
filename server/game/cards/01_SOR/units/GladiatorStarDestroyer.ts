import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, WildcardCardType } from '../../../core/Constants';

export default class GladiatorStarDestroyer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8294130780',
            internalName: 'gladiator-star-destroyer'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Give a unit sentinel for this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                })
            }
        });
    }
}
