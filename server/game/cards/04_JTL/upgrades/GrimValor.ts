import AbilityHelper from '../../../AbilityHelper';
import { Trait, WildcardCardType } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class GrimValor extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3291001746',
            internalName: 'grim-valor'
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card: Card) => card.hasSomeTrait(Trait.Vehicle));

        this.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'Exhaust a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}
