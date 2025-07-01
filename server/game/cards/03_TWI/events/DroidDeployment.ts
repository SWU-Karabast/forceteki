import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';

export default class DroidDeployment extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6826668370',
            internalName: 'droid-deployment',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Create 2 Battle Droid tokens',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid({ amount: 2 })
        });
    }
}
