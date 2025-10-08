import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class SithHolocron extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0412810079',
            internalName: 'sith-holocron',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.attachTarget.hasSomeTrait(Trait.Force));

        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'Deal 2 damage to a friendly unit. If you do, this unit gets +2/+0 for this attack',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            },
            ifYouDo: {
                title: 'This unit gets +2/+0 for this attack',
                immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                })
            }
        });
    }
}