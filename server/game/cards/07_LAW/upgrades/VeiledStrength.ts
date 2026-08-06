import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class VeiledStrength extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '7057086144',
            internalName: 'veiled-strength',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.attachTarget.isNonLeaderUnit());

        registrar.addConstantAbilityTargetingAttached({
            title: `Attached unit gains ${TextHelper.Grit}`,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Grit)
        });
    }
}
