import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class HomeOneOnMyMark extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1356826899',
            internalName: 'home-one#on-my-mark',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: 'This units costs 3 resources less to play',
            condition: (context) => context.player.opponent.getArenaUnits({ arena: ZoneName.SpaceArena }).length >= 3,
            amount: 3
        });
    }
}
