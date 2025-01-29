import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class Cunning extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3789633661',
            internalName: 'cunning',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Cunning modal ability:',
            immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects({
                amountOfChoices: 2,
                choices: () => ({
                    ['Return a non-leader unit with 4 or less power to its owner\'s hand']: AbilityHelper.immediateEffects.selectCard({
                        cardCondition: (card) => card.isNonLeaderUnit() && card.getPower() <= 4,
                        innerSystem: AbilityHelper.immediateEffects.returnToHand()
                    }),
                    ['Give a unit +4/+0 for this phase']: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        innerSystem: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: AbilityHelper.ongoingEffects.modifyStats({ power: 4, hp: 0 })
                        })
                    }),
                    ['Exhaust up to 2 units']: AbilityHelper.immediateEffects.selectCard({
                        mode: TargetMode.UpTo,
                        numCards: 2,
                        cardTypeFilter: WildcardCardType.Unit,
                        innerSystem: AbilityHelper.immediateEffects.exhaust()
                    }),
                    ['An opponent discards a random card from their hand']: AbilityHelper.immediateEffects.discardCardsFromOpponentsHand({
                        random: true,
                        amount: 1
                    })
                })
            })
        });
    }
}
