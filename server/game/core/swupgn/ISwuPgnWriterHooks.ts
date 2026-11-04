import type { Card } from '../card/Card';
import type { ZoneName } from '../Constants';

/** What the engine tells the SWU-PGN writer directly, outside the event stream. The writer implements it. */
export interface ISwuPgnWriterHooks {

    /** A card was put into a deck: it becomes a new entity if it comes back (W-22). */
    onCardEnteredDeck(card: Card): void;

    /** A card finished a move into `zoneName` (every `Card.moveTo` and capture goes through `Card.postMoveSteps`). */
    onCardEnteredZone(card: Card, zoneName: ZoneName): void;
}
