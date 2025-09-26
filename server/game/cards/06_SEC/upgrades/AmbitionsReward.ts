import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class AmbitionsReward extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'ambitions-reward-id',
            internalName: 'ambitions-reward',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create a Spy token',
            immediateEffect: AbilityHelper.immediateEffects.createSpy(),
        });
    }
}