import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { CardType, WildcardCardType } from '../../../core/Constants';

export default class Vigilance extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8615772965',
            internalName: 'vigilance',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Vigilance modal ability:',
            immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects({
                amountOfChoices: 2,
                choices: (context) => ({
                    ['Discard 6 cards from an opponent\'s deck.']: AbilityHelper.immediateEffects.discardFromDeck({
                        target: context.player.opponent,
                        amount: 6
                    }),
                    ['Heal 5 damage from a base.']: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: CardType.Base,
                        immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 5 }),
                    }),
                    ['Defeat a unit with 3 or less remaining HP.']: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card: any) => card.remainingHp <= 3,
                        immediateEffect: AbilityHelper.immediateEffects.defeat()
                    }),
                    ['Give a Shield token to a unit.']: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.giveShield()
                    }),
                })
            })
        });
    }
}
