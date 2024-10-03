import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class RivalsFall extends EventCard {
    protected override getImplementationId () {
        return {
            id: '5303936245',
            internalName: 'rivals-fall',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Defeat an unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            }
        });
    }
}

RivalsFall.implemented = true;
