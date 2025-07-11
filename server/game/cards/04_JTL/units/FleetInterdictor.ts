import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class FleetInterdictor extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0235116526',
            internalName: 'fleet-interdictor',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenDefeatedAbility({
            title: 'Defeat a space unit that costs 3 or less',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.SpaceArena,
                cardCondition: (card) => card.isUnit() && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
        });
    }
}
