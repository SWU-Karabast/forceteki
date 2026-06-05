import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ChildrenOfTheWatch extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5980742717',
            internalName: 'children-of-the-watch',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create 2 Mandalorian tokens',
            immediateEffect: abilityHelper.immediateEffects.createMandalorian({ amount: 2 })
        });
    }
}