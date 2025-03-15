import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class ApologyAccepted extends EventCard {
    protected override getImplementationId () {
        return {
            id: '9283378702',
            internalName: 'apology-accepted',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Defeat a friendly unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            then: {
                title: 'Give 2 Experience tokens to a unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.giveExperience({ amount: 2 })
                }
            }
        });
    }
}
