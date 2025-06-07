import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, KeywordName } from '../../../core/Constants';

export default class AscensionCable extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '6128668392',
            internalName: 'ascension-cable',
        };
    }

    public override canAttach(targetCard: Card): boolean {
        return targetCard.isUnit() && !targetCard.hasSomeTrait(Trait.Vehicle);
    }

    public override setupCardAbilities () {
        this.addGainKeywordTargetingAttached({
            keyword: KeywordName.Saboteur
        });
    }
}