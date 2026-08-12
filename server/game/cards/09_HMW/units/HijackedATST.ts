import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { AbilityRestriction, PhaseName } from '../../../core/Constants';

export default class HijackedATST extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'hijacked-atst-id',
            internalName: 'hijacked-atst',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'This unit does not ready during the next regroup phase',
            immediateEffect: abilityHelper.immediateEffects.delayedCardEffect((context) => ({
                title: 'This unit does not ready during this regroup phase',
                target: context.source,
                when: {
                    onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                },
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: abilityHelper.ongoingEffects.cardCannot(AbilityRestriction.DoesNotReadyDuringRegroup),
                    ongoingEffectDescription: 'prevent {0} from readying',
                })
            }))
        });
    }
}