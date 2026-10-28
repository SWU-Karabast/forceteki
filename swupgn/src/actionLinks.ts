import type { GameEvent } from './types';

/**
 * Actions a sub-record can be filed under. `render.ts` uses the same test, `isTopLevelActionRecord`.
 *
 * `ABILITY_ACTIVATE` is in the set but qualifies only when its `kind` is `action` or `epic` —
 * using an action ability is one of the six things CR 6.1 lets a player spend their action on,
 * while a triggered, keyword or replacement ability is a consequence of some other action and
 * belongs under it. See `isTopLevelActionRecord`.
 */
const TOP_LEVEL_ACTIONS = new Set([
    'PLAY', 'PLAY_EVENT', 'PLAY_UPGRADE', 'PLAY_SMUGGLE', 'DEPLOY_LEADER',
    'ATTACK', 'PASS', 'CLAIM_INITIATIVE', 'ABILITY_ACTIVATE',
]);

/** Whether this record is an action in its own right (spec §9, §16). */
export function isTopLevelActionRecord(e: GameEvent): boolean {
    if (!TOP_LEVEL_ACTIONS.has(e.t)) {
        return false;
    }
    // A lettered seq is a sub-step whatever its type: a leader deployed BY its own Epic Action
    // is the ability's consequence (R1.A.1 ABILITY_ACTIVATE, R1.A.1c DEPLOY_LEADER), and the
    // player took one action, not two.
    if ((/^R\d+\.[SAG]\.\d+[a-z]+$/).test(e.seq)) {
        return false;
    }
    if (e.t !== 'ABILITY_ACTIVATE') {
        return true;
    }
    return e.kind === 'action' || e.kind === 'epic';
}

/**
 * Which record types can precede an action DEPENDS ON THE ACTION.
 *
 * An attack announces itself after picking a target and exhausting the attacker, and that is all:
 * it never moves a card or restates its stats. A play does the opposite -- the card arrives, gets
 * its stats, enters exhausted, and the cost is paid -- before the `PLAY` is announced.
 *
 * Keeping one shared set gets an AMBUSH unit wrong: it is played and attacks in the same phase, so
 * the play's own `MOVE` and `STATS` sit immediately before the `ATTACK` and name the same card,
 * and a shared set files them under the attack. They belong to the play, which already owns them
 * through its own step number.
 *
 * Both sets are deliberately narrow: a `DAMAGE` or `DEFEAT` is always a CONSEQUENCE, never a
 * precursor, so meeting one ends the run.
 */
const ATTACK_PRECURSORS = new Set(['CHOICE', 'MODAL_CHOICE', 'EXHAUST']);
const PLAY_PRECURSORS = new Set([
    'MOVE', 'CHOICE', 'MODAL_CHOICE', 'EXHAUST', 'STATS', 'EXHAUST_RESOURCES',
]);
// An action ability announces itself after the player has picked it out of the card's menu and
// chosen its target, and that is all: its costs (the leader exhausting, the resources spent) are
// paid AFTER initiation and are numbered under the ability's own step.
const ABILITY_PRECURSORS = new Set(['CHOICE', 'MODAL_CHOICE']);

/**
 * A play's precursors also take in what the played card itself does as it enters play, before the
 * play is announced: an ability of that card (Clone's "enter play as a copy") and the lasting
 * effect it starts on itself. Only when the record names the played card -- `card` for the
 * ability, `src` for the effect -- so another card's trigger or effect still ends the run.
 */
const PLAY_OWN_PRECURSORS = new Set(['ABILITY_ACTIVATE', 'EFFECT_START']);

/** The card a play's own entering ability or effect is about: `card`, or an effect's `src`. */
function enteringCard(e: GameEvent): string | undefined {
    const any = e as { card?: unknown; src?: unknown };
    const card = e.t === 'EFFECT_START' ? any.src : any.card;
    return typeof card === 'string' ? card : undefined;
}

function precursorsFor(t: string): Set<string> {
    if (t === 'ATTACK') {
        return ATTACK_PRECURSORS;
    }
    return t === 'ABILITY_ACTIVATE' ? ABILITY_PRECURSORS : PLAY_PRECURSORS;
}

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

/**
 * The host an upgrade (or a leader deployed as a pilot) is played onto. The host's `STATS` lands
 * after the upgrade's own `MOVE` and before the `PLAY_UPGRADE`, so it is the play's -- but only
 * there: a host `STATS` from before that `MOVE` was left by an earlier action.
 */
function actionHost(e: GameEvent): string | undefined {
    const target = (e as { target?: unknown }).target;
    return (e.t === 'PLAY_UPGRADE' || e.t === 'DEPLOY_LEADER') && typeof target === 'string' ? target : undefined;
}

/**
 * Records a writer wrote while a play of a card was being set up -- its choices and the costs paid
 * before it is announced (an Exploit defeat, a card discarded instead of paying), keyed by record.
 *
 * Position cannot say this. A card the actor discards just before their play is that play's cost
 * when the play demanded it, and the previous action's consequence when that action forced it;
 * the two records look the same. Only the writer knows which, from the engine, so it says so with
 * `markPlaySetup` and the linker takes it at its word. The mark lives beside the record, never in
 * it, so it never reaches the file; keyed weakly, it goes when the record does. Keyed by identity,
 * too: a writer must hand `linkActionSteps` the very records it marked, not copies (the recorder's
 * Exploit and alternate-cost specs read the served file, so a copy on that path fails them).
 */
const playSetupMarks = new WeakMap<GameEvent, string>();

/** Writer side: `e` was written while a play of `card` was being set up (see `playSetupMarks`). */
export function markPlaySetup(e: GameEvent, card: string): void {
    playSetupMarks.set(e, card);
}

/** The card whose play's setup wrote `e`, when the writer marked it. */
function playSetupOf(e: GameEvent): string | undefined {
    return playSetupMarks.get(e);
}

/** The seat a record names as its `p`, if it has one. */
function seatOf(e: GameEvent): unknown {
    return (e as { p?: unknown }).p;
}

/** Whether a precursor record names `card` -- the anchor that ties a run to its action. */
function names(e: GameEvent, card: string): boolean {
    const any = e as { card?: unknown; atk?: unknown };
    return any.card === card || any.atk === card;
}

/**
 * The second anchor, for an action ability: the menu choice that PICKED it.
 *
 * A `CHOICE` / `MODAL_CHOICE` carries no card id, so the card-name anchor can never fire for the
 * prompts that lead into an ability -- they would stay filed under whatever was numbered before
 * them, which is the opponent's action. The option the player actually chose IS the ability's
 * `title`, though, so it names the ability as exactly as a card id names a play.
 */
function chose(e: GameEvent, title: string | undefined): boolean {
    if (!title || (e.t !== 'MODAL_CHOICE' && e.t !== 'CHOICE')) {
        return false;
    }
    return Array.isArray(e.offered) && e.offered[e.chose] === title;
}

/**
 * Fold a run of adjacent `READY_RESOURCES` for the same seat into one record (spec §10.1).
 *
 * The regroup step readies the row one card at a time, and the recorder faithfully wrote one
 * record per resource: a seven-round game carried 54 `READY_RESOURCES`, every one `amount: 1`.
 * They carry no information a single `amount: N` does not — the row's ready state is COUNTED,
 * never named, so there is no per-resource identity for the extra records to be about, and the
 * fold does nothing but add `amount` up.
 *
 * Only an unbroken run merges, so two readyings with anything at all between them stay two
 * records. Per-card `READY` is untouched: those name a card, so each one says something.
 *
 * A pass over the finished list rather than a recorder-side counter, for the same reason
 * `linkActionSteps` is: an undo truncates the event list, and a pass over what survived cannot
 * be left holding a total from records that were rolled back.
 */
export function coalesceResourceReadies(events: GameEvent[], referencedSeqs: ReadonlySet<string> = new Set()): GameEvent[] {
    const out: GameEvent[] = [];
    for (const e of events) {
        const prev = out[out.length - 1];
        if (
            e.t === 'READY_RESOURCES' && prev?.t === 'READY_RESOURCES' &&
            prev.p === e.p && prev.for === e.for &&
            // Merging DELETES this record's seq. Anything still pointing at it -- an annotation's
            // `ref`, another record's `for` -- would be left citing a position that is no longer
            // in the file. Keep a cited record whole; the saving is not worth a dangling ref.
            !referencedSeqs.has(e.seq)
        ) {
            out[out.length - 1] = { ...prev, amount: prev.amount + e.amount };
            continue;
        }
        out.push(e);
    }
    return out;
}

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

export function linkActionSteps(events: GameEvent[]): GameEvent[] {
    const out = events.slice();

    for (let i = 0; i < out.length; i++) {
        const action = out[i];
        // A resourcing is announced the same way round: the card's hand->resource MOVE lands
        // first and the RESOURCE that summarises it follows, so the move carries the PREVIOUS
        // beat's number (the draw burst, or the other seat's commit) unless it is stamped.
        // It is the one pre-announcement run `for` used to miss.
        if (action.t === 'RESOURCE' && i > 0) {
            const prev = out[i - 1];
            if (prev.t === 'MOVE' && prev.to === 'resource' && prev.card === action.card && prev.for == null) {
                out[i - 1] = { ...prev, for: action.seq };
            }
            continue;
        }
        if (!isTopLevelActionRecord(action) || !isTopLevelStep(action.seq)) {
            continue;
        }
        const card = actionCard(action);
        if (card == null) {
            continue;   // a PASS owns no card, so nothing can be anchored to it
        }

        // Walk back over the contiguous run of precursor records immediately before the action.
        //
        // A record the writer marked as this play's setup is the play's, whatever it is: an
        // Exploit's DEFEAT, a card discarded instead of paying and its DISCARD (see
        // playSetupMarks). Marks are read off `events`, not `out`, whose entries may be copies.
        //
        // An unmarked record about some other card ends the run. That card's stat change or
        // exhaust is the previous action's consequence (a token landing on it, a Raid ending), not
        // this action's precursor, however close it sits. So is another card ARRIVING in play: a
        // "When the action phase starts" trigger's Beast lands just before the first play, with
        // the same MOVE/STATS/EXHAUST shape a play's precursors have. So is another card LEAVING:
        // a discard just before the actor's play is the play's cost only when the writer says so;
        // left to position it is just as likely a discard the previous action forced.
        // A choice or a resource payment by the OTHER seat ends the run too: those carry no card
        // id, so only the seat says they were the previous action's, such as an event's target
        // choice in front of the opponent's next play.
        // A played upgrade's host is the action's own card too, but only between the upgrade's
        // own MOVE and its announcement (see actionHost); walking back, that is until the walk
        // has passed that MOVE.
        const precursors = precursorsFor(action.t);
        let host = actionHost(action);
        let start = i;
        while (start > 0) {
            const prev = out[start - 1];
            if (isTopLevelStep(prev.seq)) {
                break;
            }
            const named = actionCard(prev);
            // Walking back past the card's own MOVE ends the host's share of the run, marked or not.
            const ownMove = prev.t === 'MOVE' && named === card;
            if (playSetupOf(events[start - 1]) === card) {
                if (ownMove) {
                    host = undefined;
                }
                start--;
                continue;
            }
            if (!precursors.has(prev.t)) {
                // The played card's own entering ability or effect (see PLAY_OWN_PRECURSORS).
                if (precursors === PLAY_PRECURSORS && PLAY_OWN_PRECURSORS.has(prev.t) && enteringCard(prev) === card) {
                    start--;
                    continue;
                }
                break;
            }
            const otherSeat = seatOf(prev) !== seatOf(action);
            if (otherSeat && (prev.t === 'CHOICE' || prev.t === 'MODAL_CHOICE' || prev.t === 'EXHAUST_RESOURCES')) {
                break;
            }
            if (named != null && named !== card && named !== host) {
                break;
            }
            if (ownMove) {
                host = undefined;
            }
            start--;
        }
        if (start >= i) {
            continue;
        }

        // Only file the run when something in it actually names the action's card. Without that
        // anchor the run is just as likely to be the PREVIOUS action's tail -- an on-play CHOICE
        // sitting in front of an unrelated attack, say -- and a wrong link is worse than none.
        const run = out.slice(start, i);
        const title = action.t === 'ABILITY_ACTIVATE' ? action.title : undefined;
        if (!run.some((e) => names(e, card) || chose(e, title))) {
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
