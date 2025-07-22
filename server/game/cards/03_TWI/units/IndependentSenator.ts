import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class IndependentSenator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9262288850',
            internalName: 'independent-senator'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Exhaust a unit with 4 or less power.',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(2), AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.getPower() <= 4,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}
