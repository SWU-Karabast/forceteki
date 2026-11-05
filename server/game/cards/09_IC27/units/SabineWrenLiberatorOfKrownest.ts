import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import {EventName, TargetMode, WildcardCardType} from '../../../core/Constants';

export default class SabineWrenLiberatorOfKrownest extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'sabine-wren#liberator-of-krownest-id',
            internalName: 'sabine-wren#liberator-of-krownest',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Discard 2 cards from a deck. You may deal damage to a unit equal to the difference in those cards\' costs',
            targetResolver: {
                mode: TargetMode.Select,
                choices: ({
                    'Your deck': AbilityHelper.immediateEffects.sequential([
                        AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                            target: context.player,
                            amount: 2
                        }))
                    ]),
                    'Opponent\'s deck': AbilityHelper.immediateEffects.sequential([
                        AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                            target: context.player.opponent,
                            amount: 2
                        }))
                    ])
                })
            },
            ifYouDo: (ifYouDoContext) => {
                const discardedCards = ifYouDoContext.events
                    .filter((event) => event.name === EventName.OnCardDiscarded)
                    .map((event) => event.card);

                return {
                    title: 'Deal damage to a unit equal to the difference in those cards\' costs',
                    optional: true,
                    targetResolver: {
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.damage(() => {
                            if (discardedCards.length < 2) {
                                return { target: null, amount: 0 };
                            }

                            const [card1, card2] = discardedCards;
                            const costDiff = Math.abs(card1.cost - card2.cost);

                            return { amount: costDiff };
                        })
                    }
                };
            },
        });
    }
}