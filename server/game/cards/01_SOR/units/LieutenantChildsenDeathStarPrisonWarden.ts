import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, RelativePlayer, Location, TargetMode } from '../../../core/Constants';

export default class LieutenantChildsenDeathStarPrisonWarden extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2855740390',
            internalName: 'lieutenant-childsen#death-star-prison-warden'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Reveal up to 4 Vigilance cards from your hand',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 4,
                controller: RelativePlayer.Self,
                locationFilter: Location.Hand,
                cardCondition: (card) => card.hasSomeAspect(Aspect.Vigilance),
                immediateEffect: AbilityHelper.immediateEffects.reveal(),
            },
            then: (thenContext) => ({
                title: 'For each card revealed this way, give an Experience token to this unit',
                thenCondition: () => thenContext.target.length > 0,
                effect: 'gain {1} experience',
                effectArgs: [thenContext.target.length],
                immediateEffect: AbilityHelper.immediateEffects.giveExperience({ amount: thenContext.target.length }),
            })
        });
    }
}

LieutenantChildsenDeathStarPrisonWarden.implemented = true;