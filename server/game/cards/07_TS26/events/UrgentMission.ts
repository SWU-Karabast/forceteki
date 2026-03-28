import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';

export default class UrgentMission extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'urgent-mission-id',
            internalName: 'urgent-mission',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Deal 2 damage to your base. Draw 2 cards',
            immediateEffect: abilityHelper.immediateEffects.simultaneous([
                abilityHelper.immediateEffects.damage((context) => ({
                    amount: 2,
                    target: context.player.base,
                })),
                abilityHelper.immediateEffects.draw((context) => ({
                    amount: 2,
                    target: context.player,
                }))
            ])
        });
    }
}