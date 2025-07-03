import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';

export default class Devotion extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '8788948272',
            internalName: 'devotion',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addGainKeywordTargetingAttached({
            keyword: KeywordName.Restore,
            amount: 2
        });
    }
}
