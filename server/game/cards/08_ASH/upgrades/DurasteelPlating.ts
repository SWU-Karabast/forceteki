import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class DurasteelPlating extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7117552802',
            internalName: 'durasteel-plating',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give a Shield token to attached unit.',
            immediateEffect: AbilityHelper.immediateEffects.giveShield((context) => ({
                target: context.source.parentCard
            }))
        });
    }
}
