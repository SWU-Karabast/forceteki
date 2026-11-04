import type { Card } from '../card/Card';

/** What the engine tells the SWU-PGN writer directly, outside the event stream. The writer implements it. */
export interface ISwuPgnWriterHooks {

    /** A card was put into a deck: it becomes a new entity if it comes back (W-22). */
    onCardEnteredDeck(card: Card): void;
}
