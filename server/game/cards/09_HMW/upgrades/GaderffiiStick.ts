import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class GaderffiiStick extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3960334269',
            internalName: 'gaderffii-stick',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.attachTarget.isUnit() && context.attachTarget.getPower() <= 3 && !context.attachTarget.hasSomeTrait(Trait.Vehicle)
        );
    }
}