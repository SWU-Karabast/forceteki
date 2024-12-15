import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RepublicDefenseCarrier extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6238512843',
            internalName: 'republic-defense-carrier',
        };
    }

    public override setupCardAbilities() {
        this.addDecreaseCostAbility({
            title: 'This unit costs 1 resource less to play for each unit controlled by the opponent who controls the most units',
            amount: (_card, player) => player.opponent.getArenaUnits().length,
        });
    }
}

RepublicDefenseCarrier.implemented = true;
