import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class SuperlaserBlast extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1353201082',
            internalName: 'superlaser-blast',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat all units',
            immediateEffect: AbilityHelper.immediateEffects.defeat((context) => {
                const allUnits = context.game.getArenaUnits();
                return { target: allUnits };
            })
        });
    }
}
