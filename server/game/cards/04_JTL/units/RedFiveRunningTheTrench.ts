import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class RedFiveRunningTheTrench extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8500401413',
            internalName: 'red-five#running-the-trench',
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'Deal 2 damage to a damaged unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.damage > 0,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}
