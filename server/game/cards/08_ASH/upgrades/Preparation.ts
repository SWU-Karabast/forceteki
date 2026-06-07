import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class Preparation extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '8752784897',
            internalName: 'preparation',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Exhaust attached unit',
            immediateEffect: AbilityHelper.immediateEffects.exhaust((context) => ({ target: context.source.parentCard }))
        });
    }
}