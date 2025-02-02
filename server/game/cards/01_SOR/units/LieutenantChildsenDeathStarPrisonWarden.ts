import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, RelativePlayer, ZoneName, TargetMode } from '../../../core/Constants';

export default class LieutenantChildsenDeathStarPrisonWarden extends NonLeaderUnitCard {
    protected override readonly overrideNotImplemented: boolean = true;

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
                zoneFilter: ZoneName.Hand,
                cardCondition: (card) => card.hasSomeAspect(Aspect.Vigilance),
                immediateEffect: AbilityHelper.immediateEffects.reveal({
                    useDisplayPrompt: true,
                    promptedPlayer: RelativePlayer.Opponent
                }),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'For each card revealed this way, give an Experience token to this unit',
                effect: 'gain {1} experience',
                effectArgs: [ifYouDoContext.target.length],
                immediateEffect: AbilityHelper.immediateEffects.giveExperience({ amount: ifYouDoContext.target.length }),
            })
        });
    }
}
