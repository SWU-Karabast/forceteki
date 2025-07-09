import AbilityHelper from '../../../AbilityHelper';
import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class TargetingComputer extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7021680131',
            internalName: 'targeting-computer',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addConstantAbilityTargetingAttached({
            title: 'You assign all indirect damage dealt by this unit',
            ongoingEffect: AbilityHelper.ongoingEffects.assignIndirectDamageDealtByUnit(),
        });
    }
}
