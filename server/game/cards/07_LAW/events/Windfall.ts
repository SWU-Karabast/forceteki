import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';

export default class Windfall extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3232608976',
            internalName: 'windfall',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Create 3 Credit tokens',
            immediateEffect: AbilityHelper.immediateEffects.createCreditToken({ amount: 3 })
        });
    }
}