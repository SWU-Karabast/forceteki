import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class PatrollingVWing extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4721628683',
            internalName: 'patrolling-vwing',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Draw a card',
            immediateEffect: AbilityHelper.immediateEffects.draw((context) => ({ target: context.player })),
        });
    }
}
