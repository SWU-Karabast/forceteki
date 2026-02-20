import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class PhoenixSquadronFighters extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8025566663',
            internalName: 'phoenix-squadron-fighters',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addDecreaseCostAbility({
            title: 'This unit costs 1 resource less to play for each friendly damaged unit',
            amount: (_card, player) => player.getArenaUnits({ condition: (c) => c.isUnit() && c.damage > 0 }).length,
        });
    }
}