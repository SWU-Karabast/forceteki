import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class StrongerTogether extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'stronger-together-id',
            internalName: 'stronger-together',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Create 2 Mandalorian tokens',
            immediateEffect: abilityHelper.immediateEffects.createMandalorian({ amount: 2 })
        });
    }
}
