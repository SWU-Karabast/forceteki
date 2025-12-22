import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { ZoneName } from '../../../core/Constants';

export default class QuiGonJinnInfluenceChance extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'qui-gon-jinn#influence-chance-id',
            internalName: 'qui-gon-jinn#influence-chance',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Look at the top 3 cards of your deck. You may discard 1 of them.  Put the rest back on top in any order.',
            when: {
                onAttack: true,
                whenPlayed: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.sequential((context) => {
                // Capture the original top 3 cards at the start of the ability
                const topCards = context.player.getTopCardsOfDeck(3);

                return {
                    gameSystems: [
                        AbilityHelper.immediateEffects.lookAtAndSelectCard({
                            target: topCards,
                            optional: true,
                            useDisplayPrompt: true,
                            activePromptTitle: 'Select a card to discard',
                            immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard()
                        }),
                        AbilityHelper.immediateEffects.lookAtAndChooseOption(() => {
                            // Filter out any card that was discarded from our original captured array
                            const remainingCards = topCards.filter(
                                (card) => card.zoneName !== ZoneName.Discard
                            );
                            return {
                                target: remainingCards,
                                activePromptTitle: 'Place cards on top of the deck in any order',
                                perCardButtons: [
                                    {
                                        text: 'Put on top',
                                        arg: 'top',
                                        immediateEffect: AbilityHelper.immediateEffects.moveToTopOfDeck({})
                                    }
                                ]
                            };
                        })
                    ]
                };
            })
        });
    }
}