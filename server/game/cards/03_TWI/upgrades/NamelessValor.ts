import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import type { Card } from '../../../core/card/Card';
import { KeywordName } from '../../../core/Constants';

export default class NamelessValor extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4886127868',
            internalName: 'nameless-valor'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.setAttachCondition((card: Card) => card.isToken());
        registrar.addGainKeywordTargetingAttached({ keyword: KeywordName.Overwhelm });
    }
}
