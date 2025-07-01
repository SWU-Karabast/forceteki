import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class DarthRevanLightsabers extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9566815036',
            internalName: 'darth-revans-lightsabers',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card) => card.isUnit() && !card.hasSomeTrait(Trait.Vehicle));

        card.addGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.parentCard?.hasSomeTrait(Trait.Sith),
            keyword: KeywordName.Grit,
        });
    }
}