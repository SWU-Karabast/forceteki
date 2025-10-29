import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageModificationType } from '../../../core/Constants';

export default class VigilSecuringTheFuture extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1970175552',
            internalName: 'vigil#securing-the-future'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addDamageModificationAbility({
            title: 'Increase all damage dealt to Vigil by another card by 1',
            modificationType: DamageModificationType.Increase,
            amount: 1,
            shouldCardHaveDamageModification: (card, context) => card === context.source && context.event.damageSource.card !== context.source,
        });

        registrar.addDamageModificationAbility({
            title: 'Reduce all damage dealt to friendly non-Vigil units by 1',
            modificationType: DamageModificationType.Reduce,
            amount: 1,
            shouldCardHaveDamageModification: (card, context) => card !== context.source && card.isUnit() && card.controller === context.source.controller
        });
    }
}