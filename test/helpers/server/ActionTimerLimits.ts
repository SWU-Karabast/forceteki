/**
 * The action timer's limits, as the timer specs expect them. They are written out rather than imported from
 * `ByoyomiTimer`, as the disconnect grace windows are, because players see them: changing one is a behaviour change that
 * should fail a spec.
 */
export const actionTimerLimits = {

    /** The turn time each prompt starts with. */
    turnTimeMs: 20_000,

    /** The main time each player has for the whole game, spent once a prompt's turn time is gone. */
    mainTimeMs: 120_000,

    /** Main time left at which the timer shows a warning and the chat says so. */
    warningSeconds: 30,

    /** Main time left at which the timer shows danger and the chat says so. */
    dangerSeconds: 10,
} as const;
