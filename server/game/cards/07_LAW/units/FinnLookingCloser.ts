import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class FinnLookingCloser extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6365678821',
            internalName: 'finn#looking-closer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give a Shield token to a non-unique unit',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isUnit() && !card.unique,
                immediateEffect: abilityHelper.immediateEffects.giveShield()
            }
        });
    }
}