import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BazineNetalSpyForTheFirstOrder extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5830140660',
            internalName: 'bazine-netal#spy-for-the-first-order',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Look at an opponent\'s hand',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.lookAt((context) => ({
                    target: context.player.opponent.hand,
                })),
            ]),
            then: {
                title: 'Discard 1 of those cards',
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOpponentsHand((context) => ({
                    target: context.player.opponent,
                    amount: 1,
                })),
                ifYouDo: {
                    title: 'That player draws a card',
                    immediateEffect: AbilityHelper.immediateEffects.draw((context) => ({ target: context.player.opponent })),
                }
            },
        });
    }
}

BazineNetalSpyForTheFirstOrder.implemented = true;
