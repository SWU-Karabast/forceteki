import AbilityHelper from '../../AbilityHelper';
import Card from '../../core/card/Card';
import { CardType } from '../../core/Constants';

export default class _21BSurgicalDroid extends Card {
    protected override getImplementationId() {
        return {
            id: '5449704164',
            internalName: '21b-surgical-droid'
        };
    }

    public override setupCardAbilities() {
        this.attackAbility({
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