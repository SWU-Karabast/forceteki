import AbilityHelper from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class Imprisoned extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1368144544',
            internalName: 'imprisoned',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.setAttachCondition((card) => card.isNonLeaderUnit());

        registrar.addConstantAbilityTargetingAttached({
            title: 'Attached unit loses its current abilities and can\'t gain abilities',
            ongoingEffect: AbilityHelper.ongoingEffects.loseAllAbilities()
        });
    }
}
