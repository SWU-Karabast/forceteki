import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { ZoneName } from '../../../core/Constants';

export default class VanquishTheLegion extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5236803699',
            internalName: 'vanquish-the-legion',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Give each enemy ground unit -2/-2 for this phase',
            immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                effect: abilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 }),
                target: context.player.opponent.getArenaUnits({ arena: ZoneName.GroundArena }),
            }))
        });
    }
}