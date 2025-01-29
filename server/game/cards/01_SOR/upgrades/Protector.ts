import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';

export default class Protector extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '4550121827',
            internalName: 'protector',
        };
    }

    public override setupCardAbilities () {
        this.addGainKeywordTargetingAttached({
            keyword: KeywordName.Sentinel
        });
    }
}
