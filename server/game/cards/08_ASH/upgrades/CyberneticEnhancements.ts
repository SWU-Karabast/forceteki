import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class CyberneticEnhancements extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '2053930913',
            internalName: 'cybernetic-enhancements',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Draw a card',
            immediateEffect: abilityHelper.immediateEffects.draw()
        });
    }
}