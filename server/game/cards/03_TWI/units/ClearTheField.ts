import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

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
                cardCondition: (card) => card.isNonLeaderUnit() && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand((context) => {
                    const allOpponentUnits = context.player.opponent.getUnitsInPlay();
                    const returnedCards = allOpponentUnits.filter((card) => card.isNonLeaderUnit() && card.title === context.target.title);
                    // Add the target to the list of targets if it's an ally unit
                    if (context.target.controller !== context.player.opponent) {
                        returnedCards.push(context.target);
                    }
                    return { target: returnedCards };
                }),
            }
        });
    }
}
