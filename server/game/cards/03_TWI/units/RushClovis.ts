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
            title: 'Create a Battle Droid token.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({ condition: (context) => context.source.controller.opponent.readyResourceCount === 0,
                onTrue: AbilityHelper.immediateEffects.createBattleDroid(),
                onFalse: AbilityHelper.immediateEffects.noAction() })
        });
    }
}

RushClovis.implemented = true;