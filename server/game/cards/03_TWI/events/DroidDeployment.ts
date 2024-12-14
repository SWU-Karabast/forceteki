import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';

export default class DroidDeployment extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6826668370',
            internalName: 'droid-deployment',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Create 2 Battle Droid tokens',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid({ amount: 2 })
        });
    }
}

DroidDeployment.implemented = true;
