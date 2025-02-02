import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class FivesInSearchOfTruth extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3434956158',
            internalName: 'fives#in-search-of-truth',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Put a Clone unit from your discard pile on the bottom of your deck',
            when: {
                onCardPlayed: (event, context) => event.card.isEvent() && event.card.controller === context.source.controller
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
