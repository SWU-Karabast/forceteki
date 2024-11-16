import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CloneDeserter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9503028597',
            internalName: 'clone-deserter',
        };
    }

    public override setupCardAbilities() {
        this.addBountyAbility({
            title: 'Draw a card',
            immediateEffect: AbilityHelper.immediateEffects.draw()
        });
    }
}

CloneDeserter.implemented = true;
