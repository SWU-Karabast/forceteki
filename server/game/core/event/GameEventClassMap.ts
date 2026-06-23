import type { EventName } from '../Constants';
import type { CardExhaustedEvent } from './events/CardExhaustedEvent';

/**
 * Maps each {@link EventName} to its concrete {@link GameEvent} subclass.
 *
 * One entry is added per converted event type. Events without an entry fall back
 * to the untyped {@link GameEvent} via {@link EventForName}.
 *
 * Conversion rule: when adding an entry for an event name, every construction site
 * of that event name must be converted to the typed class in the same change, so
 * that the map entry is honest for all consumers.
 */
export interface GameEventClassMap {
    [EventName.OnCardExhausted]: CardExhaustedEvent;
}

/**
 * Resolves an {@link EventName} to its typed event class if one has been registered
 * in {@link GameEventClassMap}. Falls back to `any` (not {@link GameEvent}) for
 * unconverted events so that existing dynamic property access keeps compiling
 * until each event type is converted.
 */
export type EventForName<T extends EventName> =
    T extends keyof GameEventClassMap ? GameEventClassMap[T] : any;
