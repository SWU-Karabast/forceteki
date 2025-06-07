import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';

export default class AxeWovesAccomplishedWarrior extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0126487527',
            internalName: 'axe-woves#accomplished-warrior',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'This unit gets +1/+1 for each upgrade on him.',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => ({
                power: target.upgrades.length,
                hp: target.upgrades.length,
            })),
        });
    }
}