import AbilityHelper from '../../AbilityHelper';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { CardType } from '../../core/Constants';


export default class _21BSurgicalDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5449704164',
            internalName: '21b-surgical-droid'
        };
    }

    public override setupCardAbilities() {
        this.addAttackAbility({
            title: 'Heal 2 damage from another unit',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card !== this,
                cardType: CardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 2 })
            }
        });
    }
}

_21BSurgicalDroid.implemented = true;