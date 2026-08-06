import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';

export default class NowhereToHide extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '9653971462',
            internalName: 'nowhere-to-hide',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addGainKeywordTargetingAttached({ keyword: KeywordName.Sentinel });
    }
}