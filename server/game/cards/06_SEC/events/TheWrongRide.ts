import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class TheWrongRide extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'the-wrong-ride-id',
            internalName: 'the-wrong-ride',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust 2 enemy resources',
            immediateEffect: abilityHelper.immediateEffects.exhaustResources({ amount: 2, target: this.controller.opponent })
        });
    }
}