import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class SpecialModifications extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '8828770229',
            internalName: 'special-modifications',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addWhenPlayedAbility({
            title: 'Create a Spy token',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.parentCard && context.source.parentCard.hasSomeTrait(Trait.Transport),
                onTrue: abilityHelper.immediateEffects.createSpy()
            })
        });
    }
}
