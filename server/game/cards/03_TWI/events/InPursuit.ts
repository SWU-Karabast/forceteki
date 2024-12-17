import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class InPursuit extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6401761275',
            internalName: 'in-pursuit'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Exhaust a friendly unit.',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: {
                title: 'Exhaust an enemy unit',
                targetResolver: {
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                }
            }
        });
    }
}

InPursuit.implemented = true;
