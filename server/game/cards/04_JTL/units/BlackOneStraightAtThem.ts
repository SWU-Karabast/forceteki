import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BlackOneStraightAtThem extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3389903389',
            internalName: 'black-one#straight-at-them'
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'While this unit is upgraded, it gets +1/+0.',
            condition: (context) => context.source.isUpgraded(),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });

        // this.addOnAttackAbility({
        //   title: 'If you control Poe Dameron (as a unit, upgrade, or leader), you may deal 1 damage to a unit.',
        // });
    }
}