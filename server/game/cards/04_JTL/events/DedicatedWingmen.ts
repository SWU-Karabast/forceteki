import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class DedicatedWingmen extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8382691367',
            internalName: 'dedicated-wingmen',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Create 2 X-Wing tokens',
            immediateEffect: AbilityHelper.immediateEffects.createXWing({ amount: 2 })
        });
    }
}
