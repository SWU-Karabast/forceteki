import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class Intimidation extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8761713385',
            internalName: 'intimidation',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'If you control a unit with 4 or more power, draw 2 cards',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ condition: (card) => card.isUnit() && card.getPower() >= 4 }),
                onTrue: abilityHelper.immediateEffects.draw({ amount: 2 })
            })
        });
    }
}