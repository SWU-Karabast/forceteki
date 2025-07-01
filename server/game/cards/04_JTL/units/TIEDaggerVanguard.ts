import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TIEDaggerVanguard extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7157369742',
            internalName: 'tie-dagger-vanguard'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Deal 2 damage to a damaged unit',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.damage > 0,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}
