import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Aspect } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class Condemn extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3056375127',
            internalName: 'condemn'
        };
    }

    public override setupCardAbilities(
        registrar: IUpgradeAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        const aspects = [Aspect.Vigilance, Aspect.Villainy];

        registrar.addGainOnAttackAbilityTargetingAttached({
            title: `The defending player discloses ${EnumHelpers.aspectString(aspects)} to give this unit -6/-0 for this attack`,
            gainCondition: (context) => context.source.parentCard?.isAttacking(),
            immediateEffect: AbilityHelper.immediateEffects.disclose((context) => ({
                aspects: aspects,
                target: context.event.attack.getDefendingPlayer()
            })),
            ifYouDo: {
                title: 'This unit gets -6/-0 for this attack',
                immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -6, hp: 0 })
                })
            }
        });

        registrar.addConstantAbilityTargetingAttached({
            title: 'While this unit is attacking, it loses all other abilities',
            condition: (context) => context.source.parentCard.isAttacking(),
            ongoingEffect: AbilityHelper.ongoingEffects.loseAllAbilitiesExceptFromSource()
        });
    }
}