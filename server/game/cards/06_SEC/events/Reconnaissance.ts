import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { ZoneName } from '../../../core/Constants';

export default class Reconnaissance extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'reconnaissance-id',
            internalName: 'reconnaissance',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Draw 2 cards',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    context.player.hasSomeArenaUnit({ arena: ZoneName.SpaceArena }) &&
                    context.player.hasSomeArenaUnit({ arena: ZoneName.GroundArena }),
                onTrue: abilityHelper.immediateEffects.draw({ amount: 2 })
            })
        });
    }
}