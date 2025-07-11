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

    protected override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.setAttachCondition((card) => card.isUnit() && card.hasSomeTrait(Trait.Force));
    }
}