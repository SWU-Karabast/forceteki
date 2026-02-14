import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { AbilityRestriction, PhaseName } from '../../../core/Constants';

export default class ShadowOfStygeonPrime extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3645451698',
            internalName: 'shadow-of-stygeon-prime',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.attachTarget.isNonLeaderUnit());

        registrar.addGainTriggeredAbilityTargetingAttached({
            title: 'Deal 2 damage to your base',
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
            },
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 2,
                target: context.player.base
            }))
        });

        registrar.addConstantAbilityTargetingAttached({
            title: 'Attached unit can\'t ready',
            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.Ready)
        });
    }
}