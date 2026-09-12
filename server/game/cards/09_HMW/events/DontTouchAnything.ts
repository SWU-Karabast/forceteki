import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';

export default class DontTouchAnything extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'dont-touch-anything-id',
            internalName: 'dont-touch-anything',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 3 damage to a random enemy unit',
            immediateEffect: abilityHelper.immediateEffects.randomSelection((context) => {
                const enemyUnits = context.player.opponent.getArenaUnits();
                return {
                    target: enemyUnits,
                    count: Math.min(1, enemyUnits.length),
                    innerSystem: abilityHelper.immediateEffects.damage({ amount: 3 })
                };
            })
        });
    }
}
