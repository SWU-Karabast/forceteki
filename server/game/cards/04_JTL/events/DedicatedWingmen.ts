import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';

export default class DedicatedWingmen extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8382691367',
            internalName: 'dedicated-wingmen',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Create 2 X-Wing tokens',
            immediateEffect: AbilityHelper.immediateEffects.createXWing({ amount: 2 })
        });
    }
}
