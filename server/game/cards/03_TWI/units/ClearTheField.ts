import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType, WildcardRelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class ClearTheField extends EventCard {
    protected override getImplementationId () {
        return {
            id: '9620454519',
            internalName: 'clear-the-field'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose a non-leader that costs 3 or less. Return it and each enemy non-leader unit with the same name as it to their owner\'s hand.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: WildcardRelativePlayer.Any,
                cardCondition: (card) => card.isUnit() && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand((context) => {
                    const allOpponentUnits = context.player.opponent.getUnitsInPlay();
                    const returnedCards = allOpponentUnits.filter((card) => card.title === context.target.title);
                    return { target: returnedCards };
                }),
            }
        });
    }
}

ClearTheField.implemented = true;