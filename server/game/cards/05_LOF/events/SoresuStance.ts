import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class SoresuStance extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8032269906',
            internalName: 'soresu-stance',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Play a Force unit from your hand and give a Shield token to it',
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Force),
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({ playAsType: WildcardCardType.Unit }),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give a Shield token to it',
                immediateEffect: AbilityHelper.immediateEffects.giveShield({ target: ifYouDoContext.target })
            })
        });
    }
}