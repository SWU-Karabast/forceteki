import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class HardpointHeavyBlaster extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3987987905',
            internalName: 'hardpoint-heavy-blaster',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.target.hasSomeTrait(Trait.Vehicle));

        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'Deal 2 damage to a target in the defender\'s arena',
            optional: true,
            targetResolver: {
                controller: WildcardRelativePlayer.Any,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.zoneName === context.event.attack.getSingleTarget().zoneName,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.event.attack.targetIsUnit(),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                })
            }
        });
    }
}
