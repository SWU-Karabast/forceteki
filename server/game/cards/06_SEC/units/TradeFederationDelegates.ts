import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TradeFederationDelegates extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'trade-federation-delegates-id',
            internalName: 'trade-federation-delegates',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create 2 Spy tokens',
            immediateEffect: abilityHelper.immediateEffects.createSpy({ amount: 2 })
        });
    }
}
