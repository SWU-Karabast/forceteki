import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class FlightOfTheInquisitor extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1393713161',
            internalName: 'flight-of-the-inquisitor'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Return a Force unit and Lightsaber upgrade from your discard pile to your hand.',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.simultaneous(
                [
                    AbilityHelper.immediateEffects.selectCard({
                        zoneFilter: ZoneName.Discard,
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card) => card.hasSomeTrait(Trait.Force),
                        innerSystem: AbilityHelper.immediateEffects.returnToHand()
                    }),
                    AbilityHelper.immediateEffects.selectCard({
                        zoneFilter: ZoneName.Discard,
                        cardTypeFilter: WildcardCardType.Upgrade,
                        cardCondition: (card) => card.hasSomeTrait(Trait.Lightsaber),
                        innerSystem: AbilityHelper.immediateEffects.returnToHand()
                    }),
                ]
            )
        });
    }
}