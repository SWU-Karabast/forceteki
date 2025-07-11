import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class FirstOrderStormtrooper extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6861397107',
            internalName: 'first-order-stormtrooper',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 indirect damage to a player',
            when: {
                onAttack: true,
                whenDefeated: true,
            },
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 1 })
            },
        });
    }
}
