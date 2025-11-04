import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageModificationType } from '../../../core/Constants';

export default class UmbaranMobileCannon extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8495959027',
            internalName: 'umbaran-mobile-cannon',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addDamageModificationAbility({
            title: 'The first time this unit would take damage each phase, prevent that damage',
            modificationType: DamageModificationType.PreventAll,
            limit: abilityHelper.limit.perPhase(1)
        });
    }
}
