import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class HeirloomLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9852723156',
            internalName: 'heirloom-lightsaber'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        // Attach to a non-Vehicle unit
        registrar.setAttachCondition((card) => card.isUnit() && !card.hasSomeTrait(Trait.Vehicle));

        // If attached unit is a Force unit, it gains Restore 1
        registrar.addGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.parentCard?.hasSomeTrait(Trait.Force),
            keyword: KeywordName.Restore,
            amount: 1
        });
    }
}
