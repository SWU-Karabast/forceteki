import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BodhiRook extends NonLeaderUnitCard {
    protected override readonly overrideNotImplemented: boolean = true;

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
                    target: context.player.opponent.hand,
                })),

                AbilityHelper.immediateEffects.discardCardsFromOpponentsHand((context) => ({
                    cardCondition: (card) => !card.isUnit(),
                    target: context.player.opponent,
                    amount: 1
                })),
            ])
        });
    }
}
