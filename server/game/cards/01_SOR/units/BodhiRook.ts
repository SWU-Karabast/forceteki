import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class BodhiRook extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7257556541',
            internalName: 'bodhi-rook#imperial-defector'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Look at an opponent\'s hand and discard a non-unit card from it.',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromHand((context) => ({
                cardTypeFilter: WildcardCardType.Any,
                cardCondition: (card) => !card.isUnit(),
                discardingPlayerType: RelativePlayer.Opponent,
                target: context.player.opponent,
                amount: 1
            })),
        });
    }
}

BodhiRook.implemented = true;