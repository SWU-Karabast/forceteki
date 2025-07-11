import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RedSquadronXWing extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5751831621',
            internalName: 'red-squadron-xwing',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 2 damage to this unit. If you do, draw a card',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 }),
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: AbilityHelper.immediateEffects.draw()
            }
        });
    }
}
