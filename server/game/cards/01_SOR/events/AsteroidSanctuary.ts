import AbilityHelper from '../../../AbilityHelper';
import { UnitCard } from '../../../core/card/CardTypes';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardLocation } from '../../../core/Constants';

export default class AsteroidSanctuary extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6901817734',
            internalName: 'asteroid-sanctuary'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Exhaust an enemy unit and give a shield to a friendly unit that costs 3 or less',
            targetResolvers: {
                exhaust: {
                    locationFilter: WildcardLocation.AnyArena,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                },
                shield: {
                    controller: RelativePlayer.Self,
                    cardCondition: (card) => (card as UnitCard).cost <= 3,
                    immediateEffect: AbilityHelper.immediateEffects.giveShield()
                }
            }
        });
    }
}

AsteroidSanctuary.implemented = true;
