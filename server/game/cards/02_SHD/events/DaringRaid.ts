import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class DaringRaid extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7826408293',
            internalName: 'daring-raid',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal 2 damage to a unit or base',
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}

DaringRaid.implemented = true;