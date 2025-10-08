import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class GrievoussWheelBike extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0875550518',
            internalName: 'grievouss-wheel-bike',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addGainKeywordTargetingAttached({ keyword: KeywordName.Overwhelm });

        registrar.addDecreaseCostAbility({
            title: 'While playing this upgrade on General Grievous, it costs 2 resources less to play',
            amount: 2,
            attachTargetCondition: (card) => card.title === 'General Grievous'
        });
    }
}
