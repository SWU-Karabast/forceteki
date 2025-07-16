import AbilityHelper from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class AdmiralAckbarItsATrap extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7514405173',
            internalName: 'admiral-ackbar#its-a-trap',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar) {
        registrar.addActionAbility({
            title: 'Exhaust a non-leader unit. If you do, its controller creates an X-Wing token',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.abilityActivationResourceCost(1)],
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Its controller creates an X-Wing token',
                immediateEffect: AbilityHelper.immediateEffects.createXWing({ target: ifYouDoContext.target.controller })
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'Exhaust a non-leader unit. If you do, its controller creates an X-Wing token',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Its controller creates an X-Wing token',
                immediateEffect: AbilityHelper.immediateEffects.createXWing({ target: ifYouDoContext.target.controller })
            })
        });
    }
}
