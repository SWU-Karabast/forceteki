import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class DarthMaulsLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '2167393423',
            internalName: 'darth-mauls-lightsaber',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) =>
            context.attachTarget.controller === context.controllingPlayer &&
            !context.attachTarget.hasSomeTrait(Trait.Vehicle)
        );

        registrar.addWhenPlayedAbility({
            title: 'Attack with Darth Maul. For this attack, he gains overwhelm and can\'t attack bases.',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.parentCard?.title === 'Darth Maul',
                onTrue: AbilityHelper.immediateEffects.attack((attackCtx) => ({
                    target: attackCtx.source.parentCard,
                    targetCondition: (target) => target.isUnit(),
                    optional: false,
                    attackerLastingEffects: {
                        effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm)
                    }
                }))
            })
        });
    }
}