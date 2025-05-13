import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { TargetMode, WildcardCardType, WildcardRelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class MotherTalzinPowerThroughMagick extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'mother-talzin#power-through-magick-id',
            internalName: 'mother-talzin#power-through-magick',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Give a unit -1/-1 for this phase',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.useTheForce()
            ],
            targetResolver: {
                activePromptTitle: 'Choose a unit to give -1/-1',
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: -1 }),
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'Give a unit -1/-1 for this phase',
            optional: true,
            targetResolver: {
                activePromptTitle: 'Choose a unit to give -1/-1',
                mode: TargetMode.Single,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: WildcardRelativePlayer.Any,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: -1 }),
                })
            }
        });
    }
}