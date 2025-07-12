import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class OnyxSquadronBrute extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1164297413',
            internalName: 'onyx-squadron-brute',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenDefeatedAbility({
            title: 'Heal 2 damage from a base',
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 2 })
            }
        });
    }
}
