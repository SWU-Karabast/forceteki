import { CardPool, GamesToWinMode, SwuGameFormat } from '../../../server/game/core/Constants';
import type { IQueueFormatKey } from '../../../server/gamenode/QueueHandler';

/**
 * The match configuration nearly every spec wants: Premier, the current card pool, best of one. It is
 * the same shape `/api/create-lobby` and `/api/enter-queue` take for their format fields, which is
 * what production calls an {@link IQueueFormatKey}. Specs that need a variation spread it, e.g.
 * `{ ...premierBestOfOne, format: SwuGameFormat.Eternal }`.
 */
export const premierBestOfOne: Readonly<IQueueFormatKey> = {
    format: SwuGameFormat.Premier,
    cardPool: CardPool.Current,
    gamesToWinMode: GamesToWinMode.BestOfOne,
};

/** {@link premierBestOfOne}, played as a best-of-three set. */
export const premierBestOfThree: Readonly<IQueueFormatKey> = {
    ...premierBestOfOne,
    gamesToWinMode: GamesToWinMode.BestOfThree,
};
