import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';

export default class Protector extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '4550121827',
            internalName: 'protector',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addGainKeywordTargetingAttached({
            keyword: KeywordName.Sentinel
        });
    }
}
