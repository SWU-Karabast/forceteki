import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class TargetedForRemoval extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'targeted-for-removal-id',
            internalName: 'targeted-for-removal',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'An opponent creates Credit tokens equal to this unit\'s cost',
            optional: false,
            immediateEffect: abilityHelper.immediateEffects.createCreditToken((context) => ({ amount: context.source.printedCost, target: context.player.opponent }))
        });
    }
}