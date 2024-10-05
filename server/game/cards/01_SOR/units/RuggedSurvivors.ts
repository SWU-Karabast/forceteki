import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardLocation } from '../../../core/Constants';

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
                condition: (context) => context.source.controller.leader.deployed,
                onTrue: AbilityHelper.immediateEffects.draw((context) => ({ target: context.source.controller })),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });
    }
}

RuggedSurvivors.implemented = true;
