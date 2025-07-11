import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class FlightOfTheInquisitor extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1393713161',
            internalName: 'flight-of-the-inquisitor'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Return a Force unit and Lightsaber upgrade from your discard pile to your hand.',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.simultaneous(
                [
                    AbilityHelper.immediateEffects.selectCard({
                        zoneFilter: ZoneName.Discard,
                        controller: RelativePlayer.Self,
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card) => card.hasSomeTrait(Trait.Force),
                        immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                    }),
                    AbilityHelper.immediateEffects.selectCard({
                        zoneFilter: ZoneName.Discard,
                        controller: RelativePlayer.Self,
                        cardTypeFilter: WildcardCardType.Upgrade,
                        cardCondition: (card) => card.hasSomeTrait(Trait.Lightsaber),
                        immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                    }),
                ]
            )
        });
    }
}