import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class SparkOfRebellion extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2050990622',
            internalName: 'spark-of-rebellion'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Look at an opponent\'s hand and discard a card from it.',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.lookAt((context) => ({
                    target: context.player.opponent.hand,
                })),

                AbilityHelper.immediateEffects.discardCardsFromOpponentsHand((context) => ({
                    target: context.player.opponent,
                    amount: 1
                })),
            ])
        });
    }
}
