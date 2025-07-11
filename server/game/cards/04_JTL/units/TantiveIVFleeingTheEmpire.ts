import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TantiveIVFleeingTheEmpire extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6854247423',
            internalName: 'tantive-iv#fleeing-the-empire'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Create an X-Wing token.',
            immediateEffect: AbilityHelper.immediateEffects.createXWing()
        });
    }
}
