import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

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
            when: {
                onAttack: true,
                whenPlayed: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                activePromptTitle: 'Select a card to discard',
                searchCount: 3,
                selectCount: 1,
                shuffleWhenDone: false,
                optional: true,
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.discardSpecificCard(),
                remainingCardsImmediateEffect: AbilityHelper.immediateEffects.lookAtAndChooseOption({
                    activePromptTitle: 'Place cards on top of the deck in any order',
                    perCardButtons: [
                        {
                            text: 'Put on top',
                            arg: 'top',
                            immediateEffect: AbilityHelper.immediateEffects.moveToTopOfDeck({})
                        }
                    ]
                })
            }),
        });
    }
}
