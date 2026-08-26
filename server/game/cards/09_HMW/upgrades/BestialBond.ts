import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class BestialBond extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'bestial-bond-id',
            internalName: 'bestial-bond',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create a Beast token',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.parentCard != null &&
                  (context.source.parentCard.hasSomeTrait(Trait.Creature) || context.source.parentCard.hasSomeTrait(Trait.Force)),
                onTrue: abilityHelper.immediateEffects.createBeast()
            })
        });
    }
}
