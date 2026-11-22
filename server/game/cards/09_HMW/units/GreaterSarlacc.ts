import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class GreaterSarlacc extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2124614099',
            internalName: 'greater-sarlacc',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar): void {
        registrar.addAdjustCostAbility({
            title: `While playing this unit, you may defeat any number of ready resources you control. For each resource defeated this way, this unit costs ${TextHelper.resource(3)} less to play`,
            costAdjustType: CostAdjustType.DefeatResources,
            amountPerResource: 3,
            readyResourcesOnly: true
        });
    }
}
