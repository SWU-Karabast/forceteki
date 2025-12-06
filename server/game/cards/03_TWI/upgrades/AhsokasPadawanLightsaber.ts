import type { IAbilityHelper } from '../../../AbilityHelper';
import { Trait } from '../../../core/Constants';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class AhsokasPadawanLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0741296536',
            internalName: 'ahsokas-padawan-lightsaber'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addWhenPlayedAbility({
            title: 'Attack with a unit',
            optional: true,
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.parentCard?.title === 'Ahsoka Tano',
                    onTrue: AbilityHelper.immediateEffects.attack(),
                })
            }
        });
    }
}
