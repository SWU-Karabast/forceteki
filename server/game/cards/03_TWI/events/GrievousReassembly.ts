import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class GrievousReassembly extends EventCard {
    protected override getImplementationId () {
        return {
            id: '6732988831',
            internalName: 'grievous-reassembly',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Heal 3 damage from a unit. Create a Battle Droid token',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 3 }),
                }),
                AbilityHelper.immediateEffects.createBattleDroid((context) => ({ target: context.player })) // TODO: determine why default target doesn't work here
            ]),
        });
    }
}
