import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RedSquadronYWing extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7831643253',
            internalName: 'red-squadron-ywing',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'Deal 3 indirect damage to the defending player',
            immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer((context) => ({
                amount: 3,
                target: context.player.opponent,
            })),
        });
    }
}