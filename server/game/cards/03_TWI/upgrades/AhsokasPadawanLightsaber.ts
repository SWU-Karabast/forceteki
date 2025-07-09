import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { Trait } from '../../../core/Constants';
import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class AhsokasPadawanLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0741296536',
            internalName: 'ahsokas-padawan-lightsaber'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

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
