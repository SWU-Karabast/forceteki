import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class NebulaIgnition extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6196035152',
            internalName: 'nebula-ignition',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Defeat each unit that isn\'t upgraded',
            immediateEffect: AbilityHelper.immediateEffects.defeat((context) => {
                const allUnits = context.player.getUnitsInPlay().filter((x) => !x.isUpgraded())
                    .concat(context.player.opponent.getUnitsInPlay().filter((x) => !x.isUpgraded()));
                return { target: allUnits };
            })
        });
    }
}
