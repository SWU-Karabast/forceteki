import type { IAbilityHelper } from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class LukesLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6903722220',
            internalName: 'lukes-lightsaber',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        registrar.addWhenPlayedAbility({
            title: 'Heal all damage from Luke and give him a shield token',
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                target: context.source.parentCard,
                condition: context.source.parentCard?.title === 'Luke Skywalker',
                onTrue: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.heal({ amount: context.source.parentCard.damage }),
                    AbilityHelper.immediateEffects.giveShield()]),
            }))
        });
    }
}
