import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class EvasiveManeuver extends EventCard {
    protected override getImplementationId () {
        return {
            id: '5038195777',
            internalName: 'evasive-maneuver',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Exhaust a unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
        });
    }
}
