import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { TargetMode, WildcardCardType, WildcardRelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class ObiWanKenobiCourageMakesHeroes extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2693401411',
            internalName: 'obiwan-kenobi#courage-makes-heroes',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Give an Experience token to a unit without an Experience token on it',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.useTheForce()
            ],
            targetResolver: {
                activePromptTitle: 'Choose unit to give Experience token to',
                mode: TargetMode.Single,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: WildcardRelativePlayer.Any,
                cardCondition: (card) => card.isUnit() &&
                  !card.upgrades.some((upgrade) => upgrade.title === 'Experience'),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'Give an Experience token to another unit without an Experience token on it',
            optional: true,
            targetResolver: {
                activePromptTitle: 'Choose unit to give Experience token to',
                mode: TargetMode.Single,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: WildcardRelativePlayer.Any,
                cardCondition: (card, context) => card.isUnit() && card !== context.source &&
                  !card.upgrades.some((upgrade) => upgrade.title === 'Experience'),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}