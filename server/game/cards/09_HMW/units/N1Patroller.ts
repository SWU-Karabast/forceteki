import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class N1Patroller extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5712834448',
            internalName: 'n1-patroller',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat a non-leader unit with 1 or less remaining HP.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.isUnit() && card.remainingHp <= 1,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}