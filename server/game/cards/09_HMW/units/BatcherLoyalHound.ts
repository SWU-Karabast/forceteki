import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BatcherLoyalHound extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'batcher#loyal-hound-id',
            internalName: 'batcher#loyal-hound'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit gets +1/+0 while defending',
            condition: (context) => context.source.isDefending(),
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });
    }
}
