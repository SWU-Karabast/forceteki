import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class FrontlineShuttle extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2471223947',
            internalName: 'frontline-shuttle',
        };
    }

    protected override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Attack with a unit, even if it’s exhausted. It can’t attack bases for this attack.',
            cost: AbilityHelper.costs.defeatSelf(),
            initiateAttack: {
                targetCondition: (target) => target.isUnit(),
                allowExhaustedAttacker: true
            }
        });
    }
}
