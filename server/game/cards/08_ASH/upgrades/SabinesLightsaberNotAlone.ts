import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class SabinesLightsaberNotAlone extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'sabines-lightsaber#not-alone-id',
            internalName: 'sabines-lightsaber#not-alone',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addGainConstantAbilityTargetingAttached({
            title: 'If attached unit is Sabine Wren or a Force unit, it gains Restore 2',
            condition: (context) => context.source.hasSomeTrait(Trait.Force) || context.source.title === 'Sabine Wren',
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 2 })
        });
    }
}