import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class HeavyBlasterCannon extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1759165041',
            internalName: 'heavy-blaster-cannon',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card) => card.isUnit() && !card.hasSomeTrait(Trait.Vehicle));

        card.addWhenPlayedAbility({
            title: 'You may deal 1 damage to a ground unit. Then, deal 1 damage to the same unit. Then, deal 1 damage to the same unit.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.damage({ amount: 1 }),
                    AbilityHelper.immediateEffects.damage({ amount: 1 }),
                    AbilityHelper.immediateEffects.damage({ amount: 1 })
                ])
            }
        });
    }
}