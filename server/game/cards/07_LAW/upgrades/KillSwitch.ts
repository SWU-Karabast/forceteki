import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class KillSwitch extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '6489301305',
            internalName: 'kill-switch'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Exhaust attached unit.',
            immediateEffect: AbilityHelper.immediateEffects.exhaust((context) => ({
                target: context.source.isInPlay() ? context.source.parentCard : null
            }))
        });
    }
}