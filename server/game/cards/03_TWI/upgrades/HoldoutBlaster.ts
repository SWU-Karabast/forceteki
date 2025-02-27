import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class HoldoutBlaster extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '7280804443',
            internalName: 'holdout-blaster',
        };
    }

    public override setupCardAbilities () {
        this.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        this.addWhenPlayedAbility({
            title: 'You may have attached unit deal 1 damage to a ground unit.',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: 1,
                    source: context.source.parentCard
                }))
            }
        });
    }
}
