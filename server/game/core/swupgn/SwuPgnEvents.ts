/**
 * Writer-only notifications the engine emits for the SWU-PGN writer. They are plain `game.emit` payloads, not
 * GameEvents: no card ability can trigger on them, and they have no `:postResolve`. The names are outside the
 * `EventName` enum so that a card `when` handler can never mistake one for a real event.
 */
export const SwuPgnEvents = {
    /** Deck cards shown to a player by a prompt that raises no LookAt event (payload `ILookMoveDeckCardsViewed`). */
    DeckCardsViewed: 'swuPgn:deckCardsViewed'
} as const;
