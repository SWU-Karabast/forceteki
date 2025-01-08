import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RushClovis extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9964112400',
            internalName: 'rush-clovis#banking-clan-scion'
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'If the defending player controls no ready resources, create a Battle Droid token.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({ condition: (context) => context.source.controller.opponent.resources.filter((resource) => !resource.exhausted).length === 0,
                onTrue: AbilityHelper.immediateEffects.createBattleDroid(),
                onFalse: AbilityHelper.immediateEffects.noAction() })
        });
    }
}

RushClovis.implemented = true;