import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class VultureInterceptorWing extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7000286964',
            internalName: 'vulture-interceptor-wing'
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Give an enemy unit -1/-1 for this phase',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: -1 })
                })
            }
        });
    }
}

VultureInterceptorWing.implemented = true;
