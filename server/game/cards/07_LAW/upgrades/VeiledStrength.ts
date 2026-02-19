import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';

export default class VeiledStrength extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'veiled-strength-id',
            internalName: 'veiled-strength',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.attachTarget.isNonLeaderUnit());

        registrar.addConstantAbilityTargetingAttached({
            title: 'Attached unit gains Grit',
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Grit)
        });
    }
}
