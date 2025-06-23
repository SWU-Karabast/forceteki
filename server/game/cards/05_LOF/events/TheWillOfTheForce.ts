import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { EventName, WildcardCardType } from '../../../core/Constants';

export default class TheWillOfTheForce extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9021149512',
            internalName: 'the-will-of-the-force',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Return a non-leader unit to its owner\'s hand and use the Force to make that player discard a card',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    immediateEffect: AbilityHelper.immediateEffects.returnToHand(),
                }),
                AbilityHelper.immediateEffects.optional({
                    title: 'Use the Force',
                    innerSystem: AbilityHelper.immediateEffects.useTheForce(),
                }),
            ]),
            ifYouDo: (ifYouDoContext) => ({
                title: 'That player discards a random card from their hand',
                ifYouDoCondition: (context) => context.target !== undefined && context.events.some((event) => event.name === EventName.OnCardLeavesPlay && event.card.isForceToken() && event.player === context.player),
                immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand({
                    target: ifYouDoContext.target?.owner,
                    amount: 1,
                    random: true
                }),
            }),
        });
    }
}