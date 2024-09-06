import AbilityHelper from '../../AbilityHelper';
import { EventCard } from '../../core/card/EventCard';

export default class Repair extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8679831560',
            internalName: 'repair',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Heal 3 damage from a unit or base',
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 3 })
            }
        });
    }
}

Repair.implemented = true;