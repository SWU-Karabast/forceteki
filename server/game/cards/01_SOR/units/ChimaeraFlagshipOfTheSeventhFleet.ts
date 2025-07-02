import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';


export default class ChimaeraFlagshipOfTheSeventhFleet extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7728042035',
            internalName: 'chimaera#flagship-of-the-seventh-fleet',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addOnAttackAbility({
            title: 'Name a card',
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: card.game.playableCardTitles,
                condition: (context) => context.player.opponent.hand.length > 0   // skip ability if opponent has no cards in hand
            },
            then: (thenContext) => ({
                title: 'An opponent reveals their hand and discards a card with that name from it',
                thenCondition: (context) => context.player.opponent.hand.length > 0,   // skip ability if opponent has no cards in hand
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.reveal((context) => ({
                        target: context.player.opponent.hand,
                        useDisplayPrompt: true
                    })),
                    AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                        target: context.player.opponent,
                        cardCondition: (card, _context) => card.title === thenContext.select,
                        amount: 1
                    }))
                ])
            })
        });
    }
}
