import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';
import { type IAbilityHelper } from '../../../AbilityHelper';

export default class TooStrongForBlasters extends EventCard {
    protected override getImplementationId () {
        return {
            id: '7014669428',
            internalName: 'too-strong-for-blasters',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Heal 2 damage from a unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.heal({ amount: 2 }),
            }
        });
    }
}