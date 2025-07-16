import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TheDaughterEmbodimentOfLight extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0662915879',
            internalName: 'the-daughter#embodiment-of-light',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Use the Force to heal 2 damage from your base',
            when: {
                onDamageDealt: (event, context) => event.card === context.player.base
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Heal 2 damage from your base',
                immediateEffect: AbilityHelper.immediateEffects.heal((context) => ({
                    amount: 2,
                    target: context.player.base
                }))
            }
        });
    }
}