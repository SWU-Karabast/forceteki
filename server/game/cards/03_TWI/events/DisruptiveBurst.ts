import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class DisruptiveBurst extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3596811933',
            internalName: 'disruptive-burst',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Give each enemy unit -1/-1 for this phase',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: -1 }),
                target: context.player.opponent.getArenaUnits(),
            })
            ),
        });
    }
}
