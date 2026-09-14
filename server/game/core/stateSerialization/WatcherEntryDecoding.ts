import type { Card } from '../card/Card';
import type { Player } from '../Player';
import { MatchLoadError } from './MatchLoadError';
import type { LoadedPositionIndex } from './LoadedPositionIndex';
import { PRIOR_STINT_ID } from './SavedMatchInterfaces';
import type {
    ISavedCardRef,
    ISavedCounterOrdinal,
    ISavedLastKnownInformation,
    ISavedStintRef,
    ISavedTaggedSet,
    SavedCounterSpaceName,
} from './SavedMatchInterfaces';
import { liveStintKey, mintCounterId, resolveStintId } from './WatcherEntryEncoding';
import type { IStateWatcherLKIEntry } from '../stateWatcher/StateWatcher';

/** Everything a watcher decoder needs to turn saved coordinates back into live references. */
export interface IWatcherDecodeContext {
    index: LoadedPositionIndex;
    playerBySeat: ReadonlyMap<string, Player>;
    counterSpaceSizes: Readonly<Record<SavedCounterSpaceName, number>>;
}

export function decodeSeat(context: IWatcherDecodeContext, seat: string): Player {
    const player = context.playerBySeat.get(seat);
    if (player == null) {
        throw new MatchLoadError(`A state-watcher entry names seat "${seat}", which is not one of the loaded players.`);
    }
    return player;
}

export function decodeOptionalSeat(context: IWatcherDecodeContext, seat: string | null): Player | undefined {
    return seat == null ? undefined : decodeSeat(context, seat);
}

/** Resolves a mandatory referent. Every mandatory member's saved value is non-null by the schema's own contract (§ nullability), so a null here is a document integrity problem. */
export function decodeRequiredReferent(context: IWatcherDecodeContext, ref: ISavedCardRef | null): Card {
    if (ref == null) {
        throw new MatchLoadError('A state-watcher entry is missing a required card reference.');
    }
    return context.index.resolveRef(ref);
}

export function decodeOptionalReferent(context: IWatcherDecodeContext, ref: ISavedCardRef | null): Card | undefined {
    return ref == null ? undefined : context.index.resolveRef(ref);
}

export function decodeRequiredReferents(context: IWatcherDecodeContext, refs: readonly ISavedCardRef[]): Card[] {
    return refs.map((ref) => decodeRequiredReferent(context, ref));
}

export function decodeTaggedSet<T extends string>(saved: ISavedTaggedSet<T>): Set<T> {
    return new Set(saved.$set);
}

export function decodeLastKnownInformation(saved: ISavedLastKnownInformation | null): IStateWatcherLKIEntry | undefined {
    if (saved == null) {
        return undefined;
    }
    return {
        traits: decodeTaggedSet(saved.traits),
        type: saved.type,
        power: saved.power ?? undefined,
        arena: saved.arena ?? undefined,
    };
}

/**
 * The loader half of stint classification, wrapping `resolveStintId`. `referent` is the **live** card the
 * loader placed at the field's own referent coordinate (e.g. `parentCard`, not `card`) -- classification is
 * always against a field's own referent, never against a different field's.
 *
 * `'live'` resolves to `liveStintKey(referent)`, which is whatever the injector produced for that card --
 * not a value this function invents. Rejects a `'live'` stint whose referent has no live key (a hidden
 * zone), per the schema's own contract that such a state is untrustworthy.
 */
export function decodeStint(stint: ISavedStintRef, referent: Card | null | undefined): number | null {
    if (stint === 'live') {
        const liveKey = liveStintKey(referent);
        if (liveKey == null) {
            throw new MatchLoadError('A saved \'live\' stint reference resolved to a card with no live in-play-id key (it is in a hidden zone), which is untrustworthy.');
        }
        return resolveStintId(stint, liveKey);
    }

    return resolveStintId(stint, undefined);
}

export { PRIOR_STINT_ID };

/** Thin `null`-aware wrapper over the landed {@link mintCounterId}, converting its `SaveIntegrityError` into `MatchLoadError` so every loader-side failure is one exception type. */
export function decodeCounter(ordinal: ISavedCounterOrdinal, spaceSize: number): number | null {
    if (ordinal == null) {
        return null;
    }
    try {
        return mintCounterId(ordinal, spaceSize);
    } catch (error) {
        throw new MatchLoadError(error instanceof Error ? error.message : String(error), { cause: error });
    }
}
