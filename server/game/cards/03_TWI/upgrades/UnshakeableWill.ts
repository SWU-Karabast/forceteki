import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';

export default class UnshakeableWill extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '4991712618',
            internalName: 'unshakeable-will',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addGainKeywordTargetingAttached({ keyword: KeywordName.Sentinel });
    }
}
