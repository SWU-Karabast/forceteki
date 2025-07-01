import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class FavorableDelegate extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9479767991',
            internalName: 'favorable-delegate'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Draw a card.',
            immediateEffect: AbilityHelper.immediateEffects.draw()
        });

        card.addWhenDefeatedAbility({
            title: 'Discard a card from your hand.',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({ target: context.player, amount: 1 })),
        });
    }
}
