import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait } from '../../../core/Constants';
import { Helpers } from '../../../core/utils/Helpers';

export default class TheDarksaberOnlyTheStrongestShallRule extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '8268973927',
            internalName: 'the-darksaber#only-the-strongest-shall-rule',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addGainKeywordTargetingAttached({ keyword: KeywordName.Sentinel });

        registrar.addWhenPlayedAbility({
            title: 'If there are 4 or more different keywords among friendly units, ready attached unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                condition: Helpers.countUniqueKeywords(context.source.controller.getArenaUnits()) >= 4,
                onTrue: AbilityHelper.immediateEffects.ready({ target: context.source.parentCard }),
            }))
        });
    }
}