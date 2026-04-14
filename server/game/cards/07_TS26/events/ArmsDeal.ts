import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class ArmsDeal extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'arms-deal-id',
            internalName: 'arms-deal',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'You and an opponent each draw 2 cards',
            immediateEffect: abilityHelper.immediateEffects.draw((context) => ({
                amount: 2,
                target: [context.player, context.player.opponent]
            }))
        });
    }
}