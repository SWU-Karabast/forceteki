import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class DrydenVosThumbSpikingTheScale extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'dryden-vos#thumbspiking-the-scale-id',
            internalName: 'dryden-vos#thumbspiking-the-scale',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to a friendly unit. If it survives, give an Experience token to it',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'If it survives, give an Experience token to it',
                ifYouDoCondition: () => !ifYouDoContext.resolvedEvents[0].willDefeat,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience({
                    amount: 1,
                    target: ifYouDoContext.target
                })
            })
        });
    }
}