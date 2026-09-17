import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class Enraged extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6999486511',
            internalName: 'enraged',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbilityTargetingAttached({
            title: `Attached unit gains ${TextHelper.Raid(2)}`,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });
    }
}
