import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Aspect, KeywordName, Trait } from '../../../core/Constants';

export default class ConstructedLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3688574857',
            internalName: 'constructed-lightsaber',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.target.hasSomeTrait(Trait.Force));

        registrar.addGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.parentCard.hasSomeAspect(Aspect.Heroism),
            keyword: KeywordName.Restore,
            amount: 2,
        });

        registrar.addGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.parentCard.hasSomeAspect(Aspect.Villainy),
            keyword: KeywordName.Raid,
            amount: 2,
        });

        registrar.addGainKeywordTargetingAttached({
            gainCondition: (context) => !context.source.parentCard.hasSomeAspect([Aspect.Heroism, Aspect.Villainy]),
            keyword: KeywordName.Sentinel
        });
    }
}