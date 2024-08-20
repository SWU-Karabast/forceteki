import type { AbilityContext } from '../core/ability/AbilityContext';
import { CardType, EventName, Location, WildcardLocation } from '../core/Constants';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { Card } from '../core/card/Card';
import * as EnumHelpers from '../core/utils/EnumHelpers';
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
    public override readonly name = 'returnToHand';
    public override readonly eventName = EventName.OnCardReturnedToHand;
    public override readonly effectDescription = 'return {0} to their hand';
    public override readonly costDescription = 'returning {0} to their hand';
    protected override readonly targetType = [CardType.Unit, CardType.Upgrade, CardType.Event];
    protected override readonly defaultProperties: IReturnToHandProperties = {
        locationFilter: [WildcardLocation.AnyArena, Location.Discard]
    };

    public eventHandler(event, additionalProperties = {}): void {
        this.leavesPlayEventHandler(event, additionalProperties);
    }

    public override canAffect(card: Card, context: AbilityContext, additionalProperties = {}): boolean {
        const properties = super.generatePropertiesFromContext(context);
        return EnumHelpers.cardLocationMatches(card.location, properties.locationFilter) && super.canAffect(card, context, additionalProperties);
    }

    protected override updateEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        this.updateLeavesPlayEvent(event, card, context, additionalProperties);
        event.destination = Location.Hand;
    }
}