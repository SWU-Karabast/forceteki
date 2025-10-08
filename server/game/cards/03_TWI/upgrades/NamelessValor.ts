import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class NamelessValor extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4886127868',
            internalName: 'nameless-valor'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.target.isToken());
        registrar.addGainKeywordTargetingAttached({ keyword: KeywordName.Overwhelm });
    }
}
