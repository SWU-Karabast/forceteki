import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

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
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.lookAt((context) => ({
                    target: context.player.opponent.hand.sort((a, b) => a.title.localeCompare(b.title)),
                    sendChatMessage: true
                })),
                AbilityHelper.immediateEffects.discardCardsFromHand((context) => ({
                    cardTypeFilter: WildcardCardType.Any,
                    cardCondition: (card) => !card.isUnit(),
                    discardingPlayerType: RelativePlayer.Opponent,
                    target: context.player.opponent,
                    amount: 1
                })),
            ])
        });
    }
}

BodhiRook.implemented = true;
