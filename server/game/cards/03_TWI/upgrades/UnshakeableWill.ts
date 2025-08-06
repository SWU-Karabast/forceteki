import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';

export default class UnshakeableWill extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '4991712618',
            internalName: 'unshakeable-will',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addGainKeywordTargetingAttached({ keyword: KeywordName.Sentinel });
    }
}
