import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class SmugglersAid extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0866321455',
            internalName: 'smugglers-aid',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Heal 3 damage from your base',
            immediateEffect: AbilityHelper.immediateEffects.heal((context) => ({
                amount: 3,
                target: context.player.base
            }))
        });
    }
}
