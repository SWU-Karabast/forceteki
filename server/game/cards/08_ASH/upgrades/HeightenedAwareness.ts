import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { PhaseName } from '../../../core/Constants';

export default class HeightenedAwareness extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6098089171',
            internalName: 'heightened-awareness',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainTriggeredAbilityTargetingAttached({
            title: 'Give an Advantage token to this unit',
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
            },
            immediateEffect: abilityHelper.immediateEffects.giveAdvantage()
        });
    }
}
