import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class ATDPOccupier extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1087522061',
            internalName: 'atdp-occupier',
        };
    }

    public override setupCardAbilities() {
        this.addDecreaseCostAbility({
            title: 'This unit costs 1 resource less to play for each damaged ground unit',
            amount: (_card, player) =>
                player.getArenaUnits({
                    arena: ZoneName.GroundArena,
                    condition: (card) => card.canBeDamaged() && card.damage > 0
                }).length + player.opponent.getArenaUnits({
                    arena: ZoneName.GroundArena,
                    condition: (card) => card.canBeDamaged() && card.damage > 0
                }).length
        });
    }
}

