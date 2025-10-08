import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, KeywordName } from '../../../core/Constants';

export default class AscensionCable extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '6128668392',
            internalName: 'ascension-cable',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.target.hasSomeTrait(Trait.Vehicle));

        registrar.addGainKeywordTargetingAttached({
            keyword: KeywordName.Saboteur
        });
    }
}