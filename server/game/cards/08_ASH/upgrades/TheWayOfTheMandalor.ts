import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TheWayOfTheMandalor extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6045776127',
            internalName: 'the-way-of-the-mandalor',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: `This upgrade costs ${TextHelper.resource(1)} less to play on an Mandalorian unit`,
            amount: 1,
            attachTargetCondition: (card) => card.hasSomeTrait(Trait.Mandalorian)
        });
    }
}