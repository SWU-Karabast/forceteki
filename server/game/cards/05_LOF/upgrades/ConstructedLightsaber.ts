import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Aspect, KeywordName, Trait } from '../../../core/Constants';
import type { Player } from '../../../core/Player';

export default class ConstructedLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'temp-constructed-lightsaber-id',
            internalName: 'constructed-lightsaber',
        };
    }

    public override canAttach(targetCard: Card, _context: AbilityContext, controller: Player): boolean {
        return targetCard.isUnit() && targetCard.hasSomeTrait(Trait.Force);
    }

    public override setupCardAbilities() {
        this.addGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.hasSomeAspect(Aspect.Heroism),
            keyword: KeywordName.Restore,
            amount: 2,
        });

        this.addGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.hasSomeAspect(Aspect.Villainy),
            keyword: KeywordName.Raid,
            amount: 2,
        });

        this.addGainKeywordTargetingAttached({
            gainCondition: (context) => !context.source.hasSomeAspect([Aspect.Heroism, Aspect.Villainy]),
            keyword: KeywordName.Sentinel
        });
    }
}