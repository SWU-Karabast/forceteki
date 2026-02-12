import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class Mastery extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'mastery-id',
            internalName: 'mastery'
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: 'This upgrade costs 1 less to play on unique units',
            amount: 1,
            attachTargetCondition: (card) => card.unique
        });
    }
}
