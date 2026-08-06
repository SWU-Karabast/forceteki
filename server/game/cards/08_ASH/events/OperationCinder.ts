import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class OperationCinder extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6062959089',
            internalName: 'operation-cinder',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 5 damage to your base',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 5,
                target: context.player.base,
            })),
            then: {
                title: 'Deal 5 damage to each unit',
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: 5,
                    target: context.game.getArenaUnits()
                })),
            }
        });
    }
}
