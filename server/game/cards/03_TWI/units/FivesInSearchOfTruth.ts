import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class FivesInSearchOfTruth extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3434956158',
            internalName: 'fives#in-search-of-truth',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Put a Clone unit from your discard pile on the bottom of your deck. If you do, draw a card',
            when: {
                onCardPlayed: (event, context) => event.card.isEvent() && event.player === context.player
            },
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasSomeTrait(Trait.Clone),
                immediateEffect: AbilityHelper.immediateEffects.moveToBottomOfDeck()
            },
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: AbilityHelper.immediateEffects.draw()
            }
        });
    }
}
