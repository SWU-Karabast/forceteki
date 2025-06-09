import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Aspect, KeywordName, Trait } from '../../../core/Constants';

export default class ConstructedLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3688574857',
            internalName: 'constructed-lightsaber',
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card) => card.isUnit() && card.hasSomeTrait(Trait.Force));

        this.addGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.parentCard.hasSomeAspect(Aspect.Heroism),
            keyword: KeywordName.Restore,
            amount: 2,
        });

        this.addGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.parentCard.hasSomeAspect(Aspect.Villainy),
            keyword: KeywordName.Raid,
            amount: 2,
        });

        this.addGainKeywordTargetingAttached({
            gainCondition: (context) => !context.source.parentCard.hasSomeAspect([Aspect.Heroism, Aspect.Villainy]),
            keyword: KeywordName.Sentinel
        });
    }
}