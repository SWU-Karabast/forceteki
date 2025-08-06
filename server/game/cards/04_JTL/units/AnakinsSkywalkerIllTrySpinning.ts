import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, TargetMode } from '../../../core/Constants';

export default class AnakinsSkywalkerIllTrySpinning extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8523415830',
            internalName: 'anakin-skywalker#ill-try-spinning',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotingAbility({
            type: AbilityType.Triggered,
            title: 'Return this upgrade to its owner\'s hand',
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source.parentCard,
            },
            targetResolver: {
                mode: TargetMode.Select,
                choices: (context) => ({
                    [`Return ${context.source.title} to your hand`]: AbilityHelper.immediateEffects.returnToHand({
                        target: context.source,
                    }),
                    [`Keep ${context.source.title} attached`]: AbilityHelper.immediateEffects.noAction({
                        hasLegalTarget: true,
                    })
                })
            }
        });
    }
}
