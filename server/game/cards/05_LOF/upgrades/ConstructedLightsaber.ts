import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Aspect, KeywordName, Trait } from '../../../core/Constants';

export default class ConstructedLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3688574857',
            internalName: 'constructed-lightsaber',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card) => card.isUnit() && card.hasSomeTrait(Trait.Force));

        card.addGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.parentCard.hasSomeAspect(Aspect.Heroism),
            keyword: KeywordName.Restore,
            amount: 2,
        });

        card.addGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.parentCard.hasSomeAspect(Aspect.Villainy),
            keyword: KeywordName.Raid,
            amount: 2,
        });

        card.addGainKeywordTargetingAttached({
            gainCondition: (context) => !context.source.parentCard.hasSomeAspect([Aspect.Heroism, Aspect.Villainy]),
            keyword: KeywordName.Sentinel
        });
    }
}