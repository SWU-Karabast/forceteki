import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, KeywordName } from '../../../core/Constants';

export default class AscensionCable extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '6128668392',
            internalName: 'ascension-cable',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card) => card.isUnit() && !card.hasSomeTrait(Trait.Vehicle));

        card.addGainKeywordTargetingAttached({
            keyword: KeywordName.Saboteur
        });
    }
}