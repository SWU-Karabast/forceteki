import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import AbilityHelper from '../../../AbilityHelper';

export default class DroidDeployment extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6826668370',
            internalName: 'droid-deployment',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Create 2 Battle Droid tokens',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid({ amount: 2 })
        });
    }
}
