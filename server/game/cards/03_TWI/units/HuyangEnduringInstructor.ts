import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class HuyangEnduringInstructor extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8418001763',
            internalName: 'huyang#enduring-instructor',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Choose another friendly unit. While this unit is in play, the chosen unit gets +2/+2.',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.whileSourceInPlayCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                })
            }
        });
    }
}
