import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class R2D2FullofSolutions extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5616678900',
            internalName: 'r2d2#full-of-solutions'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Discard a card from your hand. If you do, search the top 3 cards of your deck for a card and draw it.',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard()
            },
            ifYouDo: {
                title: 'Search the top 3 cards of your deck for a card and draw it',
                immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                    searchCount: 3,
                    selectCount: 1,
                    revealSelected: false,
                    selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
                })
            }
        });
    }
}