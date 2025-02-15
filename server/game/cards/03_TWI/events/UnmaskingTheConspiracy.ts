import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class UnmaskingTheConspirancy extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0959549331',
            internalName: 'unmasking-the-conspiracy',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Discard a card from your hand',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                target: context.source.controller,
                amount: 1
            })),
            ifYouDo: {
                title: 'Look at your opponent\'s hand and discard a card from it',
                immediateEffect: AbilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                    target: context.player.opponent.hand,
                    immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard()
                }))
            },
        });
    }
}