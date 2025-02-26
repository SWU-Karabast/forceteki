import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class ProvidenceDestroyer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6436543702',
            internalName: 'providence-destroyer',
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Give an enemy space unit -2/-2 for this phase.',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.SpaceArena,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 })
                })
            }
        });
    }
}
