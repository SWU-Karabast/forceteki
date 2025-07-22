import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { ZoneName } from '../../../core/Constants';

export default class BloodSport extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2103133661',
            internalName: 'blood-sport',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 2 damage to each ground unit',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 2,
                target: context.game.getPlayers().reduce((units, player) => units.concat(player.getArenaUnits({ arena: ZoneName.GroundArena })), [])
            }))
        });
    }
}
