import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class NoDisintegrations extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4033634907',
            internalName: 'no-disintegrations',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal damage to a non-leader unit equal to 1 less than its remaining HP',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.damage({
                    amount: (target) => target.remainingHp - 1
                })
            }
        });
    }
}
