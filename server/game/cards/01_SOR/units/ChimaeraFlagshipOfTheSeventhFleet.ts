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

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Name a card',
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: this.game.playableCardTitles,
                condition: (context) => context.source.controller.opponent.hand.length > 0   // skip ability if opponent has no cards in hand
            },
            then: (thenContext) => ({
                title: 'An opponent reveals their hand and discards a card with that name from it',
                thenCondition: (context) => context.source.controller.opponent.hand.length > 0,   // skip ability if opponent has no cards in hand
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.reveal((context) => ({ target: context.source.controller.opponent.hand })),
                    AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                        target: context.source.controller.opponent,
                        cardCondition: (card, _context) => card.title === thenContext.select,
                        amount: 1
                    }))
                ])
            })
        });
    }
}

ChimaeraFlagshipOfTheSeventhFleet.implemented = true;
