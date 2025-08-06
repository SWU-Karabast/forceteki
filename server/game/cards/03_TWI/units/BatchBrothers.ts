import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BatchBrothers extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6969421569',
            internalName: 'batch-brothers',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create a Clone Trooper token.',
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper()
        });
    }
}