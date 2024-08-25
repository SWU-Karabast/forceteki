import { Card } from '../../core/card/Card';
import { UpgradeCard } from '../../core/card/UpgradeCard';
import { Keyword, Trait } from '../../core/Constants';
import Player from '../../core/Player';

export default class Devotion extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '8788948272',
            internalName: 'devotion',
        };
    }

    public override setupCardAbilities() {
        this.addGainKeywordAbilityTargetingAttached({
            keyword: Keyword.Restore,
            amount: 2
        });
    }
}

Devotion.implemented = true;
