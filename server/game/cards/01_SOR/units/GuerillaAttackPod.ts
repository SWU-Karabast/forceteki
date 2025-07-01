import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GuerillaAttackPod extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5335160564',
            internalName: 'guerilla-attack-pod'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'If a base has 15 or more damage on it, ready this unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.base.damage >= 15 || context.player.opponent.base.damage >= 15,
                onTrue: AbilityHelper.immediateEffects.ready((context) => ({ target: context.source })),
            })
        });
    }
}
