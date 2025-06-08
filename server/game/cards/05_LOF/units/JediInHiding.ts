import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class JediInHiding extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7718974573',
            internalName: 'jedi-in-hiding',
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Use the Force to make your opponent discards a card from their hand',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Your opponent discards a card from their hand',
                immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                    target: context.player.opponent,
                    amount: 1
                }))
            }
        });
    }
}
