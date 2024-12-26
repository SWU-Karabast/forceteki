import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardZoneName } from '../../../core/Constants';

export default class DeathByDroids extends EventCard {
    protected override getImplementationId () {
        return {
            id: '0968965258',
            internalName: 'death-by-droids',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Defeat a unit that costs 3 or less. Create 2 Battle Droid tokens',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardCondition: (card) => card.isUnit() && card.cost <= 3,
                    innerSystem: AbilityHelper.immediateEffects.defeat(),
                }),
                AbilityHelper.immediateEffects.createBattleDroid((context) => ({ target: context.source.controller, amount: 2 })), // TODO: determine why default target doesn't work here
            ])
        });
    }
}

DeathByDroids.implemented = true;