import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class GravCharge extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '2899934918',
            internalName: 'grav-charge',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 4 damage to attached unit and defeat this upgrade',
            contextTitle: (context) => `Deal 4 damage to ${context.source.parentCard.title} and defeat this upgrade`,
            when: {
                onAttackEnd: (event, context) => context.source.isAttached() && event.attack.attacker === context.source.parentCard
            },
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.isAttached(),
                onTrue: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.damage((context) => ({
                        amount: 4, target: context.source.parentCard
                    })),
                    abilityHelper.immediateEffects.defeat((context) => ({
                        target: context.source
                    }))
                ])
            })
        });
    }
}
