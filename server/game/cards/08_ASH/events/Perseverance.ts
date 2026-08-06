import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class Perseverance extends EventCard {
    protected override getImplementationId () {
        return {
            id: '9609892500',
            internalName: 'perseverance',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Heal 3 damage from a unit and give a Shield token to it',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.heal({ amount: 3 }),
                    AbilityHelper.immediateEffects.giveShield()
                ])
            }
        });
    }
}