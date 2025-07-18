import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class ShootFirst extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8297630396',
            internalName: 'shoot-first',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. It gets +1/+0 for this attack and deals its combat damage before the defender.',
            initiateAttack: {
                attackerCondition: (card, context) => card.controller === context.player,
                attackerLastingEffects: [
                    { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }) },
                    { effect: AbilityHelper.ongoingEffects.dealsDamageBeforeDefender() },
                ]
            }
        });
    }
}
