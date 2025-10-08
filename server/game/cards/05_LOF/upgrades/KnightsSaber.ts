import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class KnightsSaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6885149318',
            internalName: 'knights-saber',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.attachTarget.hasSomeTrait(Trait.Jedi) && !context.attachTarget.hasSomeTrait(Trait.Vehicle));
    }
}