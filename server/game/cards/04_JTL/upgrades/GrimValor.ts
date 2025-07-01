import AbilityHelper from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class GrimValor extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3291001746',
            internalName: 'grim-valor'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'Exhaust a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}
