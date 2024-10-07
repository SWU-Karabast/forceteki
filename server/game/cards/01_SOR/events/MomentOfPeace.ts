import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class MomentOfPeace extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8981523525',
            internalName: 'moment-of-peace',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Give a shield token to a unit',
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}

MomentOfPeace.implemented = true;
