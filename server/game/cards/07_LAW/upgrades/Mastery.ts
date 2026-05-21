import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class Mastery extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '5102721039',
            internalName: 'mastery'
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: `This upgrade costs ${TextHelper.resource(1)} less to play on unique units`,
            amount: 1,
            attachTargetCondition: (card) => card.unique
        });
    }
}
