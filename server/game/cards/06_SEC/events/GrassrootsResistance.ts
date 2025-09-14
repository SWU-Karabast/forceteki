import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class GrassrootsResistance extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'grassroots-resistance-id',
            internalName: 'grassroots-resistance',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 3 damage to a unit. Heal 3 damage from your base',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 }),
                }),
                AbilityHelper.immediateEffects.heal((context) => ({ amount: 3, target: context.player.base }))
            ])
        });
    }
}
