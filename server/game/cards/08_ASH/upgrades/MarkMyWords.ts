import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';

export default class MarkMyWords extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4401214542',
            internalName: 'mark-my-words',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) =>
            context.attachTarget.isUnit() && context.attachTarget.damage > 0
        );

        registrar.addGainKeywordTargetingAttached({ keyword: KeywordName.Overwhelm });
    }
}
