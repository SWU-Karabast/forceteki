import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class DisruptiveBurst extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3596811933',
            internalName: 'disruptive-burst',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Give each enemy unit -1/-1 for this phase',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: -1 }),
                target: context.source.controller.opponent.getUnitsInPlay(),
            })
            ),
        });
    }
}
