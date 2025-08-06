import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class AirSuperiority extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6410144226',
            internalName: 'air-superiority',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 4 damage to a enemy ground unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.getArenaUnits({ arena: ZoneName.SpaceArena }).length > context.player.opponent.getArenaUnits({ arena: ZoneName.SpaceArena }).length,
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    controller: RelativePlayer.Opponent,
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 4 })
                }),
            })
        });
    }
}

