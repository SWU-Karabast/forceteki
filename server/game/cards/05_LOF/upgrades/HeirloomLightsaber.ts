import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class HeirloomLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9852723156',
            internalName: 'heirloom-lightsaber'
        };
    }

    public override setupCardAbilities(card: this) {
        // Attach to a non-Vehicle unit
        card.setAttachCondition((card) => card.isUnit() && !card.hasSomeTrait(Trait.Vehicle));

        // If attached unit is a Force unit, it gains Restore 1
        card.addGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.parentCard?.hasSomeTrait(Trait.Force),
            keyword: KeywordName.Restore,
            amount: 1
        });
    }
}
