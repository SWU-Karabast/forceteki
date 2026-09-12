import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class Growth extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'growth-id',
            internalName: 'growth',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Create a Beast token. Heal 3 damage from your base. Draw a card.',
            immediateEffect: abilityHelper.immediateEffects.simultaneous([
                abilityHelper.immediateEffects.createBeast(),
                abilityHelper.immediateEffects.heal((context) => ({ amount: 3, target: context.player.base })),
                abilityHelper.immediateEffects.draw((context) => ({ target: context.player }))
            ])
        });
    }
}