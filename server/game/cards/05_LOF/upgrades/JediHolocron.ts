import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, WildcardCardType } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class JediHolocron extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7377298352',
            internalName: 'jedi-holocron',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card) => card.isUnit() && card.hasSomeTrait(Trait.Force));
        card.addGainOnAttackAbilityTargetingAttached({
            title: 'You may heal 3 damage from another unit.',
            optional: true,
            targetResolver: {
                cardCondition: (card, context) => card !== context.source,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 3 }),
            }
        });
    }
}