import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class BansheeScreamMachine extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'banshee#scream-machine-id',
            internalName: 'banshee#scream-machine',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Search the top 5 cards of your deck for a non-unit card, reveal it, and put it on top of your deck',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 5,
                cardCondition: (card) => !card.isUnit(),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.reveal({
                        useDisplayPrompt: true,
                        promptedPlayer: RelativePlayer.Opponent
                    }),
                    AbilityHelper.immediateEffects.moveToTopOfDeck()
                ])
            })
        });
    }
}
