import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageModificationType } from '../../../core/Constants';

export default class AtAttinSafetyDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4072236059',
            internalName: 'at-attin-safety-droid',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addDamageModificationAbility({
            title: 'If your base would be dealt more than 4 damage, prevent all but 4 of that damage',
            modificationType: DamageModificationType.Cap,
            amount: 4,
            shouldCardHaveDamageModification: (card, context) => card === context.source.controller.base
        });
    }
}
