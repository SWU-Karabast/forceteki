import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class JTypeNubianStarship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7074896971',
            internalName: 'jtype-nubian-starship',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Draw a card',
            immediateEffect: AbilityHelper.immediateEffects.draw()
        });

        card.addWhenDefeatedAbility({
            title: 'Discard a card from your hand',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                amount: 1,
                target: context.player
            }))
        });
    }
}