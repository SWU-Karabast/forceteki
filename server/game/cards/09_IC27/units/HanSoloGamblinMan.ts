import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class HanSoloGamblinMan extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7512736633',
            internalName: 'han-solo#gamblin-man'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Search the top 10 cards of your deck for a card and draw it',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                activePromptTitle: 'Select a card to draw',
                searchCount: 10,
                selectCount: 1,
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            }),
            then: {
                title: 'Discard a random card from your hand',
                immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                    target: context.player,
                    amount: 1,
                    random: true
                }))
            }
        });
    }
}
