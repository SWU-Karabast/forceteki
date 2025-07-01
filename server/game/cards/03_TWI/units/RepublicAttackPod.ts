import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';


export default class RepublicAttackPod extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2443835595',
            internalName: 'republic-attack-pod',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addDecreaseCostAbility({
            title: 'If you control 3 or more units, this unit costs 1 resource less to play.',
            condition: (context) => context.player.getArenaUnits({ otherThan: context.source }).length >= 3,
            amount: 1
        });
    }
}
