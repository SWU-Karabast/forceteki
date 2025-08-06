import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class CornerThePrey extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6476609909',
            internalName: 'corner-the-prey',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. It gets +1/+0 for this attack for each damage on the defender at the start of this attack.',
            initiateAttack: {
                attackerLastingEffects: (_context, attack) =>
                    ({
                        condition: () => attack.getAllTargets().some((target) => !target.isBase()),
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: attack.getAllTargets().reduce((total, target) => total + (target.isBase() ? 0 : target.damage), 0), hp: 0 })
                    })
            }
        });
    }
}
