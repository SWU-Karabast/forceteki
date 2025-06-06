import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class ItsWorse extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6707315263',
            internalName: 'its-worse',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Defeat a non-leader unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}
