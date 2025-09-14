import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CadBaneImpressedNow extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8365930807',
            internalName: 'cad-bane#impressed-now',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat a unit with 2 or less remaining HP',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.remainingHp <= 2,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}
