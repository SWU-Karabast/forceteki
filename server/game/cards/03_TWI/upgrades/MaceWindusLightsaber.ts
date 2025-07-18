import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class MaceWindusLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6410481716',
            internalName: 'mace-windus-lightsaber',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        registrar.addWhenPlayedAbility({
            title: 'Draw 2 cards',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.parentCard?.title === 'Mace Windu',
                onTrue: AbilityHelper.immediateEffects.draw({ amount: 2 }),
            })
        });
    }
}

