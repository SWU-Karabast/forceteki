import type { GameEvent } from './types';

/**
 * Stamp `for` on the records that belong to an action but were numbered BEFORE it (spec §9.1).
 *
 * The engine performs part of an action before it announces it: a card's `MOVE` into the arena
 * lands before its `PLAY`, and an attack's target `CHOICE` and the attacker's `EXHAUST` land
 * before its `ATTACK`. Those records are numbered when they arrive, so they carry the PREVIOUS
 * action's number:
 *
 *     R2.A.5a  CHOICE    (target picked)
 *     R2.A.5b  EXHAUST   (attacker exhausts)
 *     R2.A.6   ATTACK               <- all three are action 6
 *
 * A recorder cannot fix this as it goes -- when those records arrive it does not yet know an
 * action is about to follow, and guessing would mis-file a previous action's genuine
 * consequences. A WRITER can: it holds the whole event list before serialising. This is that
 * pass, so a reader never has to implement §9.1's "trailing MOVE / CHOICE / EXHAUST that name
 * the same card" heuristic.
 *
 * Returns a new array; the input is not mutated. Re-running it is harmless.
 */

/** Actions a sub-record can be filed under -- the same set the renderer numbers (§16). */
const TOP_LEVEL_ACTIONS = new Set([
    'PLAY', 'PLAY_EVENT', 'PLAY_UPGRADE', 'PLAY_SMUGGLE', 'DEPLOY_LEADER',
    'ATTACK', 'PASS', 'CLAIM_INITIATIVE', 'ABILITY_ACTIVATE',
]);

/**
 * Record types that can legitimately arrive before the action they belong to: the card's arrival
 * and readiness, the prompt that chose its target, and the cost paid for it. Deliberately NARROW
 * -- a `DAMAGE` or a `DEFEAT` is always a CONSEQUENCE, never a precursor, so meeting one ends the
 * run and a previous action's consequences can never be swept into the next action.
 */
const PRECURSOR_TYPES = new Set([
    'MOVE', 'CHOICE', 'MODAL_CHOICE', 'EXHAUST', 'STATS', 'EXHAUST_RESOURCES',
]);

/** A top-level step (`R2.A.6`), as opposed to one of its sub-steps (`R2.A.6a`). */
function isTopLevelStep(seq: string): boolean {
    return (/^R\d+\.[SAG]\.\d+$/).test(seq);
}

/** The card an action is about: the played/deployed card, or an attack's attacker. */
function actionCard(e: GameEvent): string | undefined {
    const any = e as { card?: unknown; atk?: unknown };
    if (typeof any.card === 'string') {
        return any.card;
    }
    return typeof any.atk === 'string' ? any.atk : undefined;
}

/** Whether a precursor record names `card` -- the anchor that ties a run to its action. */
function names(e: GameEvent, card: string): boolean {
    const any = e as { card?: unknown; atk?: unknown };
    return any.card === card || any.atk === card;
}

export function linkActionSteps(events: GameEvent[]): GameEvent[] {
    const out = events.slice();

    for (let i = 0; i < out.length; i++) {
        const action = out[i];
        if (!TOP_LEVEL_ACTIONS.has(action.t) || !isTopLevelStep(action.seq)) {
            continue;
        }
        const card = actionCard(action);
        if (card == null) {
            continue;   // a PASS owns no card, so nothing can be anchored to it
        }

        // Walk back over the contiguous run of precursor records immediately before the action.
        let start = i;
        while (start > 0) {
            const prev = out[start - 1];
            if (isTopLevelStep(prev.seq) || !PRECURSOR_TYPES.has(prev.t)) {
                break;
            }
            start--;
        }
        if (start === i) {
            continue;
        }

        // Only file the run when something in it actually names the action's card. Without that
        // anchor the run is just as likely to be the PREVIOUS action's tail -- an on-play CHOICE
        // sitting in front of an unrelated attack, say -- and a wrong link is worse than none.
        const run = out.slice(start, i);
        if (!run.some((e) => names(e, card))) {
            continue;
        }
        for (let j = start; j < i; j++) {
            const linked: GameEvent = { ...out[j] };
            linked.for = action.seq;
            out[j] = linked;
        }
    }

    return out;
}
