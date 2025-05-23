import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class LothWolf extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7504035101',
            internalName: 'lothwolf',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'This unit can\'t attack',
            ongoingEffect: AbilityHelper.ongoingEffects.cannotAttack()
        });
    }
}
