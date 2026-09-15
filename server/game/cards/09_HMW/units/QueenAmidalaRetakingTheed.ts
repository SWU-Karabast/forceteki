import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class QueenAmidalaRetakingTheed extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'queen-amidala#retaking-theed-id',
            internalName: 'queen-amidala#retaking-theed',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: `If you control an upgraded base, this unit costs ${TextHelper.resource(2)} less to play`,
            condition: (context) => context.player.base.isUpgraded(),
            amount: 2
        });
    }
}