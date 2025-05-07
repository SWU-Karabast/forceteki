import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class DarthRevanLightsabers extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9566815036',
            internalName: 'darth-revans-lightsabers',
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card) => card.isUnit() && !card.hasSomeTrait(Trait.Vehicle));

        this.addGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.parentCard?.hasSomeTrait(Trait.Force),
            keyword: KeywordName.Grit,
        });
    }
}