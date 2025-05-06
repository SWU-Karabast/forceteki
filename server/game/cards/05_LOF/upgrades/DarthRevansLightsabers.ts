import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait } from '../../../core/Constants';
import type { Player } from '../../../core/Player';

export default class DarthRevanLightsabers extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9566815036',
            internalName: 'darth-revans-lightsabers',
        };
    }

    public override canAttach(targetCard: Card, _context: AbilityContext, _controller: Player): boolean {
        return targetCard.isUnit() && !targetCard.hasSomeTrait(Trait.Vehicle);
    }

    public override setupCardAbilities() {
        this.addGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.parentCard?.hasSomeTrait(Trait.Force),
            keyword: KeywordName.Grit,
        });
    }
}