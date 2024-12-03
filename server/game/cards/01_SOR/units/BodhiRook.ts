import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, WildcardCardType } from '../../../core/Constants';

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
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                cardCondition: (card) => !card.isUnit(),
                target: context.player.opponent,
                amount: 1
            })),
        });
    }
}

BodhiRook.implemented = true;