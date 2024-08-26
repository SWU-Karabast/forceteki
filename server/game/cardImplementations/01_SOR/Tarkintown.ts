import AbilityHelper from '../../AbilityHelper';
import { BaseCard } from '../../core/card/BaseCard';
import { UnitCard } from '../../core/card/CardTypes';
import { CardType, WildcardCardType } from '../../core/Constants';


export default class Tarkintown extends BaseCard {
    protected override getImplementationId() {
        return {
            id: '1393827469',
            internalName: 'tarkintown',
        };
    }

    public override setupCardAbilities() {
        this.addEpicActionAbility({
            title: 'Deal 3 damage to a damaged non-leader unit',
            targetResolver: {
                cardTypeFilter: CardType.NonLeaderUnit,
                cardCondition: (card) => (card as UnitCard).damage !== 0,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
            }
        });
    }
}

Tarkintown.implemented = true;