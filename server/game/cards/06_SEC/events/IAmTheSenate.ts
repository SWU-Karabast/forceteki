import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class IAmTheSenate extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'i-am-the-senate-id',
            internalName: 'i-am-the-senate',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Create 5 Spy tokens',
            immediateEffect: AbilityHelper.immediateEffects.createSpy({ amount: 5 })
        });
    }
}
