import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class TheWrongRide extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8796918121',
            internalName: 'the-wrong-ride',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust 2 enemy resources',
            immediateEffect: abilityHelper.immediateEffects.exhaustResources((context) => ({
                amount: Math.min(2, context.player.opponent.readyResourceCount),
                target: this.controller.opponent
            }))
        });
    }
}