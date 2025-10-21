import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, CardType, ZoneName } from '../../../core/Constants';

export default class RenewedFriendship extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'renewed-friendship-id',
            internalName: 'renewed-friendship',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Return a unit from your discard pile to your hand. Create 2 Spy tokens',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    controller: RelativePlayer.Self,
                    cardTypeFilter: CardType.BasicUnit,
                    zoneFilter: ZoneName.Discard,
                    immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                }),
                AbilityHelper.immediateEffects.createSpy({ amount: 2 })
            ])
        });
    }
}
