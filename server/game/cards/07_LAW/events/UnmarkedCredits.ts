import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';

export default class UnmarkedCredits extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7477598198',
            internalName: 'unmarked-credits',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Create a Credit token',
            immediateEffect: AbilityHelper.immediateEffects.createCreditToken()
        });
    }
}