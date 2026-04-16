import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class Underestimated extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0122156036',
            internalName: 'underestimated',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.attachTarget.hasCost() && context.attachTarget.cost <= 4);
    }
}
