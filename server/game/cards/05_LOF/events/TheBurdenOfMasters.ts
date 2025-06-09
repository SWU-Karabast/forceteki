import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, TargetMode, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class TheBurdenOfMasters extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8365703627',
            internalName: 'the-burden-of-masters'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Put a Force unit from your discard on the bottom of your deck. If you do, play a card from your hand and give 2 experience tokens to it',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 1,
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Force),
                immediateEffect: AbilityHelper.immediateEffects.moveToBottomOfDeck({ shuffleMovedCards: true })
            },
            ifYouDo: {
                title: 'Play a unit from your hand, and give two experience tokens to it.',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    cardCondition: (card) => card.isUnit(),
                    immediateEffect: AbilityHelper.immediateEffects.sequential({
                        gameSystems: [
                            AbilityHelper.immediateEffects.playCardFromHand({ playAsType: WildcardCardType.Unit }),
                            AbilityHelper.immediateEffects.giveExperience({ amount: 2 }),
                        ],
                    })
                }
            }
        });
    }
}