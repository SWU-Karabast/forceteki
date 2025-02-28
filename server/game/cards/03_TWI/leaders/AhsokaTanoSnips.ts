import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { AbilityType, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class AhsokaTanoSnips extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2155351882',
            internalName: 'ahsoka-tano#snips',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addCoordinateAbility({
            type: AbilityType.Action,
            title: 'Attack with a unit. It gets +1/+0 for this attack',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    attackerLastingEffects: {
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
                    }
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'This unit gets +2/+0',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}