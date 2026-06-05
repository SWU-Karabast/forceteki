import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class WarriorsLegacy extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9104765158',
            internalName: 'warriors-legacy',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'Create a Mandalorian token',
            immediateEffect: abilityHelper.immediateEffects.createMandalorian()
        });
    }
}
