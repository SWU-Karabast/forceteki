import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, WildcardCardType } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import AbilityHelper from '../../../AbilityHelper';
import * as AbilityLimit from '../../../core/ability/AbilityLimit';

export default class GeneralsBlade extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0414253215',
            internalName: 'generals-blade',
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        this.addGainOnAttackAbilityTargetingAttached({
            title: 'The next unit you play this phase costs 2 resources less',
            gainCondition: (context) => context.source.parentCard.hasSomeTrait(Trait.Jedi),
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                effect: AbilityHelper.ongoingEffects.decreaseCost({
                    cardTypeFilter: WildcardCardType.Unit,
                    limit: AbilityLimit.perGame(1),
                    amount: 2
                })
            }),
        });
    }
}

