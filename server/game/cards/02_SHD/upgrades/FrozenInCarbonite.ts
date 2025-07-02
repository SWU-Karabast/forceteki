import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { AbilityRestriction } from '../../../core/Constants';

export default class FrozenInCarbonite extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7718080954',
            internalName: 'frozen-in-carbonite',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card: Card) => card.isNonLeaderUnit());

        card.addWhenPlayedAbility({
            title: 'Exhaust attached unit',
            immediateEffect: AbilityHelper.immediateEffects.exhaust((context) => ({
                target: context.source.parentCard
            }))
        });

        card.addConstantAbilityTargetingAttached({
            title: 'Attached unit can\'t ready',
            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.Ready)
        });
    }
}
