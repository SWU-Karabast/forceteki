import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { ZoneName } from '../../../core/Constants';

export default class HyperspaceDisaster extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'hyperspace-disaster-id',
            internalName: 'hyperspace-disaster',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat all space units',
            immediateEffect: abilityHelper.immediateEffects.defeat((context) => {
                const allSpaceUnits = context.game.getArenaUnits({ arena: ZoneName.SpaceArena });
                return { target: allSpaceUnits };
            })
        });
    }
}