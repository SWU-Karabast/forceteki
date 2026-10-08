import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class SecondChance extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '6911505367',
            internalName: 'second-chance',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.attachTarget.isNonLeaderUnit());
        registrar.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'For this phase, this unit\'s owner may play it from their discard pile for free.',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                effect: AbilityHelper.ongoingEffects.canPlayFromDiscard({
                    player: context.source.owner,
                    adjustCost: { costAdjustType: CostAdjustType.Free }
                })
            }))
        });
    }
}
