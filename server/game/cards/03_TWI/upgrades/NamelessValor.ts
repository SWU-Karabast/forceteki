import { UpgradeCard } from '../../../core/card/UpgradeCard';
import type { Card } from '../../../core/card/Card';
import { KeywordName } from '../../../core/Constants';

export default class NamelessValor extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4886127868',
            internalName: 'nameless-valor'
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card: Card) => card.isToken());
        card.addGainKeywordTargetingAttached({ keyword: KeywordName.Overwhelm });
    }
}
