import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class LukesJediLightsaberConstructedByHand extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4924242543',
            internalName: 'lukes-jedi-lightsaber#constructed-by-hand',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.parentCard?.title === 'Luke Skywalker',
            keyword: KeywordName.Sentinel
        });
    }
}