import { CardType, WildcardLocation } from '../core/Constants';
import { ReturnToHandSystem, IReturnToHandProperties } from './ReturnToHandSystem';

/**
 * Subclass of {@link ReturnToHandSystem} with specific configuration for returning to hand from play area only
 */
export class ReturnToHandFromPlaySystem extends ReturnToHandSystem {
    override targetType = [CardType.Unit, CardType.Upgrade];
    override defaultProperties: IReturnToHandProperties = {
        locationFilter: WildcardLocation.AnyArena
    };
}