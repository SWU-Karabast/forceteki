import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class BlizzardOneVeersAtTheHelm extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5480486728',
            internalName: 'blizzard-one#veers-at-the-helm',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'You may defeat a non-leader ground unit with 3 or less remaining HP',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                zoneFilter: ZoneName.GroundArena,
                cardCondition: (card) => card.isUnit() && card.remainingHp <= 3,
                immediateEffect: abilityHelper.immediateEffects.defeat()
            },
        });
    }
}