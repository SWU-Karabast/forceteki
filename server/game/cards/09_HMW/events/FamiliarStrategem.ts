import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';

export default class FamiliarStrategem extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3139780185',
            internalName: 'familiar-strategem',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. If it shares a trait with another friendly unit, it gets +2/+0 for this attack.',
            initiateAttack: {
                // The card uses a lasting effect on the attacking unit during the attack.
                attack: {
                    forEach: (context) => [context.activeCard],
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                    condition: (context) => context.player.resources.length < context.player.opponent.resources.length,
                },
            }
        });
    }
}