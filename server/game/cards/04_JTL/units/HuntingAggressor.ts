import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class HuntingAggressor extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4560739921',
            internalName: 'hunting-aggressor'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addConstantAbility({
            title: 'Indirect damage you deal to opponents is increased by 1',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyIndirectDamage({
                amount: 1,
                opponentsOnly: true
            })
        });
    }
}
