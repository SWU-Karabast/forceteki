import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class KazudaXionoImNotASpy extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'kazuda-xiono#im-not-a-spy-id',
            internalName: 'kazuda-xiono#im-not-a-spy',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control fewer resources than an opponent, this unit gets +2/+0',
            condition: (context) => context.player.resources.length < context.player.opponent.resources.length,
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}
