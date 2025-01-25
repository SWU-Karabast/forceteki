import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class HylobonEnforcer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6878039039',
            internalName: 'hylobon-enforcer',
        };
    }

    public override setupCardAbilities() {
        this.addBountyAbility({
            title: 'Draw a card',
            immediateEffect: AbilityHelper.immediateEffects.draw()
        });
    }
}
