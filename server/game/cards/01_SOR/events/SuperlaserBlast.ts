import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class SuperlaserBlast extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1353201082',
            internalName: 'superlaser-blast',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Defeat all units',
            immediateEffect: AbilityHelper.immediateEffects.defeat((context) => {
                const allUnits = context.player.getUnitsInPlay().concat(context.player.opponent.getUnitsInPlay());
                return { target: allUnits };
            })
        });
    }
}
