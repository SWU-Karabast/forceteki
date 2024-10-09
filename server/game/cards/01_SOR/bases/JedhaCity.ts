import { BaseCard } from '../../../core/card/BaseCard';
import AbilityHelper from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';

export default class JedhaCity extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '2569134232',
            internalName: 'jedha-city',
        };
    }

    public override setupCardAbilities () {
        this.setEpicActionAbility({
            title: 'Give a non-leader unit -4/-0 for this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -4, hp: 0 })
                })
            }
        });
    }
}

JedhaCity.implemented = true;
