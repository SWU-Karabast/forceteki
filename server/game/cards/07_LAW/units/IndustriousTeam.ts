import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class IndustriousTeam extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5713950795',
            internalName: 'industrious-team',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat a non-leader unit with 4 or less remaining HP.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.isUnit() && card.remainingHp <= 4,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}