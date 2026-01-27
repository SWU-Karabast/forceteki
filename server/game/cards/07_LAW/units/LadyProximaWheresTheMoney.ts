import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class LadyProximaWheresTheMoney extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'lady-proxima#wheres-the-money-id',
            internalName: 'lady-proxima#wheres-the-money',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Create a Credit token',
            cost: abilityHelper.costs.exhaustSelf(),
            immediateEffect: abilityHelper.immediateEffects.createCreditToken(),
        });
    }
}