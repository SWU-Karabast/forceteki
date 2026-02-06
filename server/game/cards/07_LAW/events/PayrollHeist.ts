import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { AbilityType } from '../../../core/Constants';

export default class PayrollHeist extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'payroll-heist-id',
            internalName: 'payroll-heist',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Each unit gains \'On Attack: Create a Credit token\' for this phase.',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.player.getArenaUnits(),
                effect: AbilityHelper.ongoingEffects.gainAbility({
                    type: AbilityType.Triggered,
                    title: 'Create a Credit token',
                    when: {
                        onAttack: true
                    },
                    immediateEffect: AbilityHelper.immediateEffects.createCreditToken()
                })
            }))
        });
    }
}
