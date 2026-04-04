import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class CaptainVaughnSearchTheTunnels extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'captain-vaughn#search-the-tunnels-id',
            internalName: 'captain-vaughn#search-the-tunnels'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Search the top 3 cards of your deck for a card and draw it.',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 3,
                selectCount: 1,
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            }),
            then: {
                title: 'Put a card from your hand on top of your deck',
                targetResolver: {
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    immediateEffect: AbilityHelper.immediateEffects.moveToTopOfDeck({})
                }
            }
        });
    }
}
