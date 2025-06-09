import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class PazVizslaUnyieldingWarrior extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3337614029',
            internalName: 'paz-vizsla#unyielding-warrior',
        };
    }

    protected override setupCardAbilities() {
        this.addConstantAbility({
            title: 'This unit gets +2/+0 for each damage on him',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => ({
                power: (target.damage * 2), hp: 0
            }))
        });
    }
}