import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class Evacuate extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8261033110',
            internalName: 'evacuate',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Return each non-leader unit to its owner\'s hand',
            immediateEffect: AbilityHelper.immediateEffects.returnToHand((context) => {
                // Reminder -- upgrades will get detached automatically during the leaves play handler
                const allNonLeaderUnits = context.game.getArenaUnits({ condition: (card) => card.isNonLeaderUnit() });
                return { target: allNonLeaderUnits };
            })
        });
    }
}
