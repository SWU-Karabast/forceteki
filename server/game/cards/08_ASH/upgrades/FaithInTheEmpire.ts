import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class FaithInTheEmpire extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4709457092',
            internalName: 'faith-in-the-empire',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: `This upgrade costs ${TextHelper.resource(1)} less to play on an ${TextHelper.Trait.Imperial} unit`,
            amount: 1,
            attachTargetCondition: (card) => card.hasSomeTrait(Trait.Imperial)
        });
    }
}