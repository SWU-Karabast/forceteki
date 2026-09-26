import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class JediInterceptor extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4746955711',
            internalName: 'jedi-interceptor'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control 6 or more resources, this unit gets +2/+0',
            condition: (context) => context.player.resources.length >= 6,
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}
