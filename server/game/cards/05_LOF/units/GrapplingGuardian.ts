import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class GrapplingGuardian extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'grappling-guardian-id',
            internalName: 'grappling-guardian',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Defeat a space unit with 6 or less remaining HP',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.SpaceArena,
                cardCondition: (card) => card.isUnit() && card.remainingHp <= 6,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            }
        });
    }
}
