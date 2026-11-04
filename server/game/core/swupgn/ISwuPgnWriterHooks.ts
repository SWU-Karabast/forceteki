import type { Card } from '../card/Card';
import type { ZoneName } from '../Constants';

/** What the engine tells the SWU-PGN writer directly, outside the event stream. The writer implements it. */
export interface ISwuPgnWriterHooks {

    /** A card was put into a deck: it becomes a new entity if it comes back (W-22). */
    onCardEnteredDeck(card: Card): void;

    /** A card finished a move into `zoneName` (every `Card.moveTo` and capture goes through `Card.postMoveSteps`). */
    onCardEnteredZone(card: Card, zoneName: ZoneName): void;

    /**
     * An ability limit of `card` was used or reset. The AbilityResolver can increment a limit after a decision point
     * (a late target prompt, or a cancel after costs) with no later event naming the card, so the limit reports it.
     */
    onAbilityLimitChanged(card: Card): void;
}
