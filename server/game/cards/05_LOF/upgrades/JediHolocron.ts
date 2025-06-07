import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class JediHolocron extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7377298352',
            internalName: 'jedi-holocron',
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card) => card.isUnit() && card.hasSomeTrait(Trait.Force));
        this.addGainOnAttackAbilityTargetingAttached({
            title: 'You may heal 3 damage from another unit.',
            optional: true,
            targetResolver: {
                controller: WildcardRelativePlayer.Any,
                cardCondition: (card, context) => card !== context.source,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 3 }),
            }

        });
    }
}