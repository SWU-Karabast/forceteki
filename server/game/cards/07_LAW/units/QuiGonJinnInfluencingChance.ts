import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { ZoneName } from '../../../core/Constants';
import { ChatHelpers } from '../../../core/chat/ChatHelpers';

export default class QuiGonJinnInfluencingChance extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9949055416',
            internalName: 'quigon-jinn#influencing-chance',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Look at the top 3 cards of your deck. You may discard 1 of them. Put the rest back on top in any order.',
            effect: 'look at the top {1} of their deck',
            effectArgs: (context) => [ChatHelpers.pluralize(context.player.getTopCardsOfDeck(3).length, 'card', 'cards')],
            when: {
                onAttack: true,
                whenPlayed: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.sequential((context) => {
                const topCards = context.player.getTopCardsOfDeck(3);
                return [
                    AbilityHelper.immediateEffects.lookAtAndSelectCard({
                        activePromptTitle: 'Select a card to discard',
                        target: topCards,
                        maxCards: 1,
                        canChooseFewer: true,
                        noSelectedCardsButtonText: 'Discard nothing',
                        immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard()
                    }),
                    AbilityHelper.immediateEffects.lookAtAndChooseOption(() => ({
                        activePromptTitle: 'Place cards on top of the deck in any order',
                        target: topCards.filter((card) => card.zoneName === ZoneName.Deck),
                        perCardButtons: [
                            {
                                text: 'Put on top',
                                arg: 'top',
                                immediateEffect: AbilityHelper.immediateEffects.moveToTopOfDeck({})
                            }
                        ]
                    }))
                ];
            }),
        });
    }
}
