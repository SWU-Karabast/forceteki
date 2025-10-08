import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class MandalorianArmor extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3514010297',
            internalName: 'mandalorian-armor'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.target.hasSomeTrait(Trait.Vehicle));

        registrar.addWhenPlayedAbility({
            title: 'Give a Shield token to attached unit.',
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                condition: context.source.parentCard?.hasSomeTrait(Trait.Mandalorian),
                onTrue: AbilityHelper.immediateEffects.giveShield({ target: context.source.parentCard }),
            }))
        });
    }
}
