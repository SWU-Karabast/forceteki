import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class AnakinSkywalkerMaverickMentor extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2282198576',
            internalName: 'anakin-skywalker#maverick-mentor',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addCoordinateAbility({
            type: AbilityType.Triggered,
            title: 'Draw a card',
            when: {
                onAttack: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.draw()
        });
    }
}
