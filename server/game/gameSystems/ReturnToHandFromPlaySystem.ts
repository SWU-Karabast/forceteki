import { CardType, WildcardCardType, WildcardLocation } from '../core/Constants';
import { ReturnToHandSystem, IReturnToHandProperties } from './ReturnToHandSystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IReturnToHandFromPlayProperties extends IReturnToHandProperties {}

/**
 * Subclass of {@link ReturnToHandSystem} with specific configuration for returning to hand from play area only
 */
export class ReturnToHandFromPlaySystem extends ReturnToHandSystem {
    protected override readonly targetTypeFilter = [WildcardCardType.Unit, CardType.Upgrade];
    protected override readonly defaultProperties: IReturnToHandFromPlayProperties = {
        locationFilter: WildcardLocation.AnyArena
    };
}