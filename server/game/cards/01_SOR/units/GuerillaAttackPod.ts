import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GuerillaAttackPod extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5335160564',
            internalName: 'guerilla-attack-pod'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'If a base has 15 or more damage on it, ready this unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.controller.base.damage >= 15 || context.source.controller.opponent.base.damage >= 15,
                onTrue: AbilityHelper.immediateEffects.ready((context) => ({ target: context.source })),
            })
        });
    }
}
