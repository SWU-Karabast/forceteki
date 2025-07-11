import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';

export default class Devotion extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '8788948272',
            internalName: 'devotion',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addGainKeywordTargetingAttached({
            keyword: KeywordName.Restore,
            amount: 2
        });
    }
}
