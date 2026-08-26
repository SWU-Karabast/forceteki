import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageModificationType } from '../../../core/Constants';

export default class NumaStillFighting extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'numa#still-fighting-id',
            internalName: 'numa#still-fighting',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addDamageModificationAbility({
            title: 'The first time this unit would take damage each phase, prevent that damage',
            modificationType: DamageModificationType.Reduce,
            amount: 1
        });
    }
}