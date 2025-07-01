import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class MedicalFrigate extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6503652883',
            internalName: 'medical-frigate'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addOnAttackAbility({
            title: 'Heal 2 damage from another unit',
            optional: true,
            targetResolver: {
                cardCondition: (card, context) => card !== context.source,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 2 })
            }
        });
    }
}
