import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class Migrate extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1299836493',
            internalName: 'migrate',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'For every 3 resources you control, create a Beast token.',
            immediateEffect: AbilityHelper.immediateEffects.createBeast((context) => ({
                amount: Math.floor(context.player.resources.length / 3),
                target: context.player,
            })),
        });
    }
}