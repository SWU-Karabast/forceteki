import type { AbilityContext } from '../core/ability/AbilityContext';
import { CardType, EventName, Location, WildcardLocation } from '../core/Constants';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import Card from '../core/card/Card';
import { cardLocationMatches } from '../core/utils/EnumHelpers';
import type { ReturnToHandFromPlaySystem } from './ReturnToHandFromPlaySystem';

type ReturnableLocation = Location.Discard | WildcardLocation.AnyArena;

export interface IReturnToHandProperties extends ICardTargetSystemProperties {
    locationFilter?: ReturnableLocation | ReturnableLocation[];
}

/**
 * Configurable class for a return to hand from X zone effect. For return to hand from play area specifically,
 * see {@link ReturnToHandFromPlaySystem}
 */
export class ReturnToHandSystem extends CardTargetSystem<IReturnToHandProperties> {
    override name = 'returnToHand';
    override eventName = EventName.OnCardReturnedToHand;
    override effectDescription = 'return {0} to their hand';
    override costDescription = 'returning {0} to their hand';
    override targetType = [CardType.Unit, CardType.Upgrade, CardType.EventTmp];
    override defaultProperties: IReturnToHandProperties = {
        locationFilter: [WildcardLocation.AnyArena, Location.Discard]
    };

    override canAffect(card: Card, context: AbilityContext, additionalProperties = {}): boolean {
        const properties = super.generatePropertiesFromContext(context);
        return cardLocationMatches(card.location, properties.locationFilter) && super.canAffect(card, context, additionalProperties);
    }

    override updateEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        this.updateLeavesPlayEvent(event, card, context, additionalProperties);
        event.destination = Location.Hand;
    }

    eventHandler(event, additionalProperties = {}): void {
        this.leavesPlayEventHandler(event, additionalProperties);
    }
}