import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class Tauntaun extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7298144465',
            internalName: 'tauntaun'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenDefeatedAbility({
            title: 'You may give a Shield token to a damaged non-Vehicle unit.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => !card.hasSomeTrait(Trait.Vehicle) && card.isUnit() && card.damage > 0,
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}
