import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class CureWounds extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3853063436',
            internalName: 'cure-wounds',
        };
    }

    protected override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Use the Force to heal 6 damage from a unit',
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Heal 6 damage from a unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 6 }),
                }
            }
        });
    }
}