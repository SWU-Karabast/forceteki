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
                const allUnits = context.game.getArenaUnits({
                    condition: (card) => card.isUnit() && !card.isUpgraded()
                });
                return { target: allUnits };
            })
        });
    }
}
