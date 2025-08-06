import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TieBomber extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3504944818',
            internalName: 'tie-bomber',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 3 indirect damage to the defending player',
            immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer((context) => ({
                amount: 3,
                target: context.player.opponent,
            })),
        });
    }
}
