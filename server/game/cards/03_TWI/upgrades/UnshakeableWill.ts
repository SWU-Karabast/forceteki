import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';

export default class UnshakeableWill extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '4991712618',
            internalName: 'unshakeable-will',
        };
    }

    public override setupCardAbilities () {
        this.addGainKeywordTargetingAttached({ keyword: KeywordName.Sentinel });
    }
}
