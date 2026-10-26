import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class EasyPrey extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4168307965',
            internalName: 'easy-prey'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Create a Beast token. An opponent creates a Beast token. Give a Weakness token to it.',
            immediateEffect: AbilityHelper.immediateEffects.sequential((context) => [
                AbilityHelper.immediateEffects.createBeast({
                    amount: 1,
                    target: context.player
                }),
                AbilityHelper.immediateEffects.createBeast({
                    amount: 1,
                    target: context.player.opponent,
                    enterPlayEffect: AbilityHelper.immediateEffects.giveWeakness()
                }),
            ])
        });
    }
}