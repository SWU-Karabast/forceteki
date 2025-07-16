import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { ZoneName } from '../../../core/Constants';

export default class ItsATrap extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0964312065',
            internalName: 'its-a-trap',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'If an opponent controls more space units than you, ready each space unit you control',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.getArenaUnits({ arena: ZoneName.SpaceArena }).length < context.player.opponent.getArenaUnits({ arena: ZoneName.SpaceArena }).length,
                onTrue: AbilityHelper.immediateEffects.ready((context) => ({ target: context.player.getArenaUnits({ arena: ZoneName.SpaceArena }) })),
            })
        });
    }
}
