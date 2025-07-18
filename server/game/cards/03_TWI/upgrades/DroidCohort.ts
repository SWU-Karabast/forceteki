import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class DroidCohort extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7547538214',
            internalName: 'droid-cohort',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'Create a Battle Droid token.',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid()
        });
    }
}
