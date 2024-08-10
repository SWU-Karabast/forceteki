import { CardType, WildcardLocation } from '../core/Constants';
import { ReturnToHandSystem, IReturnToHandProperties } from './ReturnToHandSystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IReturnToHandFromPlayProperties extends IReturnToHandProperties {}

/**
 * Subclass of {@link ReturnToHandSystem} with specific configuration for returning to hand from play area only
 */
export class ReturnToHandFromPlaySystem extends ReturnToHandSystem {
    override targetType = [CardType.Unit, CardType.Upgrade];
    override defaultProperties: IReturnToHandFromPlayProperties = {
        locationFilter: WildcardLocation.AnyArena
    };
}