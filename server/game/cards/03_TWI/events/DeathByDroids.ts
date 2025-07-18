import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardZoneName } from '../../../core/Constants';

export default class DeathByDroids extends EventCard {
    protected override getImplementationId () {
        return {
            id: '0968965258',
            internalName: 'death-by-droids',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat a unit that costs 3 or less. Create 2 Battle Droid tokens',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardCondition: (card) => card.isUnit() && card.cost <= 3,
                    immediateEffect: AbilityHelper.immediateEffects.defeat(),
                }),
                AbilityHelper.immediateEffects.createBattleDroid((context) => ({ target: context.player, amount: 2 })), // TODO: determine why default target doesn't work here
            ])
        });
    }
}
