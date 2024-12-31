import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { ZoneName, RelativePlayer, Trait, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class HardpointHeavyBlaster extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3987987905',
            internalName: 'hardpoint-heavy-blaster',
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card: Card) => card.hasSomeTrait(Trait.Vehicle));

        this.addGainOnAttackAbilityTargetingAttached({
            title: 'Deal 2 damage to a target in the defender\'s arena',
            optional: true,
            targetResolver: {
                controller: WildcardRelativePlayer.Any,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.zoneName === context.event.attack.target.zoneName,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => !context.event.attack.target.isBase(),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            }
        });
    }
}

HardpointHeavyBlaster.implemented = true;
