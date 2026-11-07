import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GreedoBigTimer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'greedo#bigtimer-id',
            internalName: 'greedo#bigtimer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While attacking or defending, this unit deals combat damage after the other attacking or defending unit',
            condition: (context) => context.source.isAttacking() || context.source.isDefending(),
            ongoingEffect: AbilityHelper.ongoingEffects.dealsCombatDamageLast(),
        });
    }
}
