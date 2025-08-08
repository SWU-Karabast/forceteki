import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class GrapplingGuardian extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2404240951',
            internalName: 'grappling-guardian',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
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
