import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TheMarauderANewHome extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9798324745',
            internalName: 'the-marauder#a-new-home',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar): void {
        registrar.addAdjustCostAbility({
            title: `While playing this unit, you may choose any number of friendly units. Deal 1 damage to each of them. For each unit chosen this way, this unit costs ${TextHelper.resource(1)} less`,
            costAdjustType: CostAdjustType.DamageUnits,
            damagePerUnit: 1,
            amountPerUnit: 1
        });
    }
}
