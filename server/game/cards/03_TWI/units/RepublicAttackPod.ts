import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';


export default class RepublicAttackPod extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2443835595',
            internalName: 'republic-attack-pod',
        };
    }

    public override setupCardAbilities() {
        this.addDecreaseCostAbility({
            title: 'If you control 3 or more units, this unit costs 1 resource less to play.',
            condition: (context) => context.source.controller.getOtherUnitsInPlay(context.source).length >= 3,
            amount: 1
        });
    }
}

RepublicAttackPod.implemented = true;
