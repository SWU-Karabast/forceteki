import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class Entrenched extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3099663280',
            internalName: 'entrenched',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbilityTargetingAttached({
            title: 'Attached unit cannot attack bases',
            ongoingEffect: AbilityHelper.ongoingEffects.cannotAttackBase(),
        });
    }
}
