import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { TargetMode, Trait } from '../../../core/Constants';

export default class SmugglingCompartment extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7280213969',
            internalName: 'smuggling-compartment',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'Ready a resource',
            targetResolver: {
                activePromptTitle: 'Choose a player to ready a resource',
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.readyResources({ amount: 1 })
            }
        });
    }
}
