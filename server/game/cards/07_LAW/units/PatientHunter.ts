import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction, PhaseName, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class PatientHunter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'patient-hunter-id',
            internalName: 'patient-hunter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give an Experience token to a unit. If you do, that unit can\'t ready during this regroup phase',
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
            },
            optional: true,
            targetResolver: {
                mode: TargetMode.Single,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience(),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'This unit can\'t ready during this regroup phase',
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    target: ifYouDoContext.target,
                    effect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.Ready)
                })
            }),
        });
    }
}