import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';


export default class R2D2IgnoringProtocol extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9568000754',
            internalName: 'r2d2#ignoring-protocol'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Look at the top 2 cards of your deck. Put any number of them on the bottom of your deck and the rest on top in any order.',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.lookMoveDeckCardsTopOrBottom({ amount: 1 })
        });
    }
}
