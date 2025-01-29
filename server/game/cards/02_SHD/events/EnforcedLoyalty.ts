import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class EnforcedLoyalty extends EventCard {
    protected override getImplementationId () {
        return {
            id: '5984647454',
            internalName: 'enforced-loyalty',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Defeat a friendly unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
            ifYouDo: {
                title: 'Draw two cards',
                immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 2 })
            }
        });
    }
}
