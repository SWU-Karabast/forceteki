import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class SteadfastBattalion extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6432884726',
            internalName: 'steadfast-battalion'
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'If you control a leader unit, give a friendly unit +2/+2 for this phase',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.leader.isDeployableLeader() && context.player.leader.deployed,
                    onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                    }),
                })
            }
        });
    }
}
