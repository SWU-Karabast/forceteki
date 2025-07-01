import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';

export default class GrievoussWheelBike extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0875550518',
            internalName: 'grievouss-wheel-bike',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        card.addGainKeywordTargetingAttached({ keyword: KeywordName.Overwhelm });

        card.addDecreaseCostAbility({
            title: 'While playing this upgrade on General Grievous, it costs 2 resources less to play',
            amount: 2,
            attachTargetCondition: (card) => card.title === 'General Grievous'
        });
    }
}
