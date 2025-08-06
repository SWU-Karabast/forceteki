import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class OnTheDoorstep extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2483302291',
            internalName: 'on-the-doorstep',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Create 3 Battle Droid tokens and ready them',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid({ amount: 3, entersReady: true })
        });
    }
}
