import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class BolsteredEndurance extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3730933081',
            internalName: 'bolstered-endurance',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((card) => card.isUnit() && card.hasSomeTrait(Trait.Force));
    }
}