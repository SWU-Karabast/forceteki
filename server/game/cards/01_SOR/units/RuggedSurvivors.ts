import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RuggedSurvivors extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4599464590',
            internalName: 'rugged-survivors'
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'Draw a card if you control a leader unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.leader.isDeployableLeader() && context.player.leader.deployed,
                onTrue: AbilityHelper.immediateEffects.draw((context) => ({ target: context.source.controller })),
            })
        });
    }
}
