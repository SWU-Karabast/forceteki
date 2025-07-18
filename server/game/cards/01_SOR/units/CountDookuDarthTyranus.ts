import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CountDookuDarthTyranus extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9624333142',
            internalName: 'count-dooku#darth-tyranus'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat a unit with 4 or less remaining HP',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.remainingHp <= 4,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}
