import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class Maim extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'maim-id',
            internalName: 'maim',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 1 damage to a unit and exhaust it',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.sequential([
                    abilityHelper.immediateEffects.damage((context) => ({ target: context.target, amount: 1 })),
                    abilityHelper.immediateEffects.exhaust((context) => ({ target: context.target }))
                ])
            }
        });
    }
}
