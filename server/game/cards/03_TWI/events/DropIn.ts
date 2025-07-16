import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import AbilityHelper from '../../../AbilityHelper';

export default class DropIn extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5074877594',
            internalName: 'drop-in',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Create 2 Clone Trooper tokens',
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper({ amount: 2 })
        });
    }
}
