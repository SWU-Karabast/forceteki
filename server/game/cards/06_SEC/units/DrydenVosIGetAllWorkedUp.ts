import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction } from '../../../core/Constants';

export default class DrydenVosIGetAllWorkedUp extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'dryden-vos#i-get-all-worked-up-id',
            internalName: 'dryden-vos#i-get-all-worked-up',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Double this unit\'s power for this attack. If you do, this unit does not ready during the next regroup phase.',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                target: context.source,
                effect: abilityHelper.ongoingEffects.modifyStats({
                    power: context.source.getPower(),
                    hp: 0
                }),
            })),
            ifYouDo: {
                title: 'This unit does not ready during the next regroup phase',
                immediateEffect: abilityHelper.immediateEffects.forThisRoundCardEffect({
                    effect: abilityHelper.ongoingEffects.cardCannot(AbilityRestriction.DoesNotReadyDuringRegroup)
                })
            }
        });
    }
}
