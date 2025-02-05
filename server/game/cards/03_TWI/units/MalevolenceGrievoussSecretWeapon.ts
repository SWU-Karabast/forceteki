import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction, RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class MalevolenceGrievoussSecretWeapon extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3381931079',
            internalName: 'malevolence#grievouss-secret-weapon',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Give an enemy unit -4/-0 for this phase. It can\'t attack this phase',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -4, hp: 0 })
                    }),
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.Attack)
                    })
                ])
            }
        });
    }
}
