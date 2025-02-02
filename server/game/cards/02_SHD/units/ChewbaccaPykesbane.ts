import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ChewbaccaPykesbane extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5169472456',
            internalName: 'chewbacca#pykesbane',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Defeat a unit with 5 or less remaining HP',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.remainingHp <= 5,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            }
        });
    }
}