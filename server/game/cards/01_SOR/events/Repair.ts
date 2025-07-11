import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class Repair extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8679831560',
            internalName: 'repair',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Heal 3 damage from a unit or base',
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 3 })
            }
        });
    }
}
