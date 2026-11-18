// Suite-wide SWU-PGN checks (`SWUPGN_ROUNDTRIP=true`): after a test, the records its writer wrote must replay to the
// writer's board, at every step as well as at the end, every view must validate, every attribute must be registered for
// the entity carrying it, no view may name a hidden card its viewer was never shown (by the reveal log at the end, and by
// the engine's own per-seat state at every step), and the writer must have counted no error.

const { isDeepStrictEqual } = require('util');
const { ATTRIBUTES, apply, applyRecord, emptyBoard, parse } = require('@swupgn/format');
const { validate } = require('@swupgn/format/validate');
const { EventName, ZoneName } = require('../../server/game/core/Constants.js');
const { SwuPgnEvents } = require('../../server/game/core/swupgn/SwuPgnEvents.js');
const { cardIdOf } = require('../../server/game/core/swupgn/SwuPgnCardIds.js');
const { seatIn, swuPgnZoneOf } = require('../../server/game/core/swupgn/projectCards.js');

const VIEWS = ['full', 1, 2, 'public'];
const SEATS = [1, 2];
const HIDDEN_ZONES = new Set(['hand', 'resource', 'deck']);
const MAX_LISTED = 5;

/** The entity kinds (the registry's `on` column) each attribute may sit on. */
const ATTRIBUTE_ON = new Map(ATTRIBUTES.map((attribute) => [attribute.name, new Set(attribute.on)]));

/**
 * Records, per seat, the cards shown to it, from the engine's own events and zones rather than the writer's audience
 * tracker: a reveal (to both seats), a look or a search (to the viewer), and a move into a zone the engine hides from
 * nobody (to both seats). A card put into a deck is forgotten, since it comes back as a new entity (W-22).
 *
 * The log is not rollback state. `ever` keeps every card shown since the last reset, forgetting nothing, and is what a
 * check reads once the game has been rolled back.
 */
class RevealLog {
    constructor() {
        /** @type {Record<number, Set<string>>} */
        this.current = { 1: new Set(), 2: new Set() };

        /** @type {Record<number, Set<string>>} */
        this.ever = { 1: new Set(), 2: new Set() };
        this.errors = 0;
    }

    /** Listens to the game's events. */
    install(game) {
        this.game = game;
        const listen = (eventName, handler) => {
            game.on(eventName, (event) => {
                try {
                    handler(event);
                } catch (error) {
                    this.errors++;
                }
            });
        };
        const seatOf = (player) => seatIn(game, player);

        listen(EventName.OnCardRevealed, (event) => this.show(event.cards, SEATS));
        listen(EventName.OnAspectsDisclosed, (event) => this.show(event.disclosedCards, SEATS));
        listen(EventName.OnLookAtCard, (event) => this.show(event.cards, [seatOf(event.viewer)]));
        listen(EventName.OnDeckSearch, (event) =>
            this.show(event.viewedCards, [seatOf(event.searchProperties?.choosingPlayer ?? event.player)])
        );
        listen(SwuPgnEvents.DeckCardsViewed, (event) => this.show(event.cards, [seatOf(event.player)]));
        listen(EventName.OnCardMoved, (event) => {
            const card = event.card;
            if (event.newZone === ZoneName.Deck) {
                for (const seat of SEATS) {
                    this.current[seat].delete(card.uuid);
                }
            } else if (card.zone != null && card.zone.hiddenForPlayers == null) {
                this.show([card], SEATS);
            }
        });
    }

    /**
     * Starts again from the current board: the test harness built a new starting board, which the writer records as
     * the game's first. Every card in a zone the engine hides from nobody is shown to both seats; nothing else is.
     */
    reset() {
        for (const seat of SEATS) {
            this.current[seat].clear();
            this.ever[seat].clear();
        }
        for (const card of this.game?.allCards ?? []) {
            if (card.zone != null && card.zone.hiddenForPlayers == null) {
                this.show([card], SEATS);
            }
        }
    }

    show(cards, seats) {
        for (const card of Array.isArray(cards) ? cards : [cards]) {
            if (card == null) {
                continue;
            }
            for (const seat of seats) {
                if (seat === 1 || seat === 2) {
                    this.current[seat].add(card.uuid);
                    this.ever[seat].add(card.uuid);
                }
            }
        }
    }

    /** The seats the card was shown to. `rolledBack` reads every card ever shown, not only those still known. */
    seatsThatSaw(uuid, rolledBack = false) {
        const log = rolledBack ? this.ever : this.current;
        return SEATS.filter((seat) => log[seat].has(uuid));
    }
}

/** Every engine card in a hand, resource row or deck: its uuid, owning seat, SWU-PGN zone and card id. */
function hiddenCardsOf(game) {
    const cards = [];
    for (const card of game.allCards) {
        const zone = swuPgnZoneOf(card.zoneName);
        if (zone !== null && HIDDEN_ZONES.has(zone)) {
            cards.push({ uuid: card.uuid, owner: seatIn(game, card.owner), zone, card: cardIdOf(card) });
        }
    }
    return cards;
}

/**
 * Adds to `into` the uuid of every card summary in `value` that carries the card's identity (`setId`): a card's
 * summary or short summary (`uuid`), or a card a display prompt shows (`cardUuid`, `IDisplayCard`).
 */
function collectShownUuids(value, into) {
    const stack = [value];
    while (stack.length > 0) {
        const item = stack.pop();
        if (item === null || typeof item !== 'object') {
            continue;
        }
        if (item.setId != null) {
            if (typeof item.uuid === 'string') {
                into.add(item.uuid);
            }
            if (typeof item.cardUuid === 'string') {
                into.add(item.cardUuid);
            }
        }
        for (const child of Array.isArray(item) ? item : Object.values(item)) {
            if (child !== null && typeof child === 'object') {
                stack.push(child);
            }
        }
    }
}

/**
 * Records, at every step the writer writes (its `stepObserver`), the writer's board and the privacy oracle of SPEC §19:
 * the card identities the engine's own per-seat state has shown each seat so far. That state is what `Game.getState`
 * sends a seat's client, built from the same calls (`Player.getStateSummary(viewer)`, which honours each zone's
 * `hiddenForPlayers`, and the ongoing-effect summary) plus the chat messages written since the last step;
 * `getState` itself is not called, since it advances chat offsets and consumes animations. Between two steps, a card
 * that enters a zone the engine hides from nobody (`hiddenForPlayers` null) is shown to both seats too, even when it
 * has left that zone again by the next step (W-44).
 *
 * A seat stops knowing every card of an opponent's hand when one of them leaves it face down (SPEC §10.3, R-17), and
 * stops knowing a card that enters a deck (W-22). Captures are keyed by seq: a rollback that writes a step again
 * replaces it and every capture after it.
 */
class StepRecorder {
    constructor() {
        /** @type {{ seq: number, board: object, hidden: object[], shown: Record<number, Set<string>>, messageCount: number }[]} */
        this.captures = [];
        this.errors = [];

        /** uuids of cards that entered a zone hidden from nobody since the last capture */
        this.enteredPublic = new Set();
    }

    install(game) {
        this.game = game;
        game.on(EventName.OnCardMoved, (event) => {
            const card = event.card;
            if (card?.zone != null && card.zone.hiddenForPlayers == null) {
                this.enteredPublic.add(card.uuid);
            }
        });
        // a recorder installed after another (the harness's, under SWUPGN_ROUNDTRIP) keeps that one told too
        const earlier = game.swuPgnWriter.stepObserver;
        game.swuPgnWriter.stepObserver = (seq) => {
            earlier?.(seq);
            try {
                this.capture(seq);
            } catch (error) {
                this.errors.push(`step ${seq}: ${error.message}`);
            }
        };
    }

    capture(seq) {
        const game = this.game;
        this.captures.length = Math.min(this.captures.length, seq);
        const previous = seq > 0 ? this.captures[seq - 1] : undefined;
        const hidden = hiddenCardsOf(game);
        const messages = game.gameChat.messages;
        const firstNewMessage = previous === undefined ? 0 : Math.min(previous.messageCount, messages.length);

        const shown = {};
        for (const viewer of game.getPlayers()) {
            const seat = seatIn(game, viewer);
            const known = new Set(previous?.shown[seat] ?? []);
            if (previous !== undefined) {
                forgetLostTrack(known, previous.hidden, hidden, seat);
            }
            collectShownUuids(game.getPlayers().map((player) => player.getStateSummary(viewer)), known);
            collectShownUuids(game.ongoingEffectEngine.summarizeOngoingEffectsForState(viewer), known);
            collectShownUuids(messages.slice(firstNewMessage), known);
            for (const uuid of this.enteredPublic) {
                known.add(uuid);
            }
            shown[seat] = known;
        }
        this.enteredPublic.clear();

        this.captures[seq] = { seq, board: game.swuPgnWriter.currentBoard(), hidden, shown, messageCount: messages.length };
    }
}

/**
 * Between two steps: when a card left an opponent's hand for the resource row or a deck, the viewer cannot tell which
 * card it was, so it forgets every card that hand held (R-17); and a card that entered a deck is a new entity (W-22).
 */
function forgetLostTrack(known, before, after, viewerSeat) {
    const zoneNow = new Map(after.map((card) => [card.uuid, card.zone]));
    for (const seat of SEATS) {
        if (seat === viewerSeat) {
            continue;
        }
        const hand = before.filter((card) => card.zone === 'hand' && card.owner === seat).map((card) => card.uuid);
        if (hand.some((uuid) => zoneNow.get(uuid) === 'resource' || zoneNow.get(uuid) === 'deck')) {
            for (const uuid of hand) {
                known.delete(uuid);
            }
        }
    }
    const inDeckBefore = new Set(before.filter((card) => card.zone === 'deck').map((card) => card.uuid));
    for (const card of after) {
        if (card.zone === 'deck' && !inDeckBefore.has(card.uuid)) {
            known.delete(card.uuid);
        }
    }
}

/**
 * @typedef {Object} SwuPgnRoundTripSubject
 * @property {import('@swupgn/format').SwuRecord[]} records the writer's records (the `full` file's RECORDS)
 * @property {import('@swupgn/format').Board} currentBoard the board the writer says its records describe
 * @property {Record<string, string>} files `fileFor(view)` for each of `full`, `1`, `2` and `public`
 * @property {number} errors the writer's error count
 * @property {{ owner: number, zone: string, card: string, seenBy: number[] }[]} hiddenCards every engine card in a
 *   hand, resource row or deck, with the seats the reveal log says were shown it
 * @property {string[]} [logProblems] problems of the reveal log itself
 * @property {{ seq: number, board: object, hidden: object[], shown: Record<number, Set<string>> }[]} [stepCaptures] the
 *   writer's board and the engine's per-seat oracle at every step (`StepRecorder`); absent when nothing recorded them
 */

/**
 * Everything the checks read, taken from the game once: flushes the writer first, so the records reach the board.
 * @returns {SwuPgnRoundTripSubject}
 */
function swuPgnSubjectOf(game, revealLog, stepRecorder) {
    const writer = game.swuPgnWriter;
    writer.flush();
    const rolledBack = writer.undos > 0;

    const files = {};
    for (const view of VIEWS) {
        files[String(view)] = writer.fileFor(view);
    }

    const hiddenCards = [];
    for (const card of game.allCards) {
        const zone = swuPgnZoneOf(card.zoneName);
        if (zone === null || !HIDDEN_ZONES.has(zone)) {
            continue;
        }
        hiddenCards.push({
            owner: seatIn(game, card.owner),
            zone,
            card: cardIdOf(card),
            seenBy: revealLog.seatsThatSaw(card.uuid, rolledBack)
        });
    }

    return {
        records: writer.records.slice(),
        currentBoard: writer.currentBoard(),
        files,
        errors: writer.errors,
        hiddenCards,
        logProblems: [
            ...(revealLog.errors > 0 ? [`reveal log: ${revealLog.errors} event handler failure(s)`] : []),
            ...(stepRecorder?.errors.length > 0 ? [`step recorder: ${listed(stepRecorder.errors)}`] : [])
        ],
        stepCaptures: stepRecorder?.captures.slice()
    };
}

/** The kinds (registry `on` values) an entity is, by SPEC §22.1. */
function kindsOf(id, entity) {
    if (id === 'g') {
        return ['game'];
    }
    if (id === 'p1' || id === 'p2') {
        return ['seat'];
    }
    if (entity.a.kind === 'effect') {
        return ['effect'];
    }

    // `unit`, `leader`, `base`, `resource` and `upgrade` are card entities of that kind or in that zone: a card in an
    // arena with no parent is a unit (a deployed leader or a token unit as well), an attached card is an upgrade
    const kinds = new Set(['card']);
    if (['unit', 'leader', 'base', 'upgrade'].includes(entity.a.kind)) {
        kinds.add(entity.a.kind);
    }
    if (entity.zone === 'resource' || entity.zone === 'base') {
        kinds.add(entity.zone);
    }
    if (entity.parent !== undefined && (entity.rel === 'attached' || entity.rel === 'pilot')) {
        kinds.add('upgrade');
    } else if (entity.parent === undefined && (entity.zone === 'ground' || entity.zone === 'space')) {
        kinds.add('unit');
    }
    return [...kinds];
}

function listed(items) {
    const shown = items.slice(0, MAX_LISTED).join('; ');
    return items.length > MAX_LISTED ? `${shown}; and ${items.length - MAX_LISTED} more` : shown;
}

/** Check 1: the records replay to the writer's board. */
function roundTripProblems(subject) {
    let replayed;
    try {
        replayed = apply(subject.records);
    } catch (error) {
        return [`round-trip: apply(records) threw: ${error.message}`];
    }
    if (isDeepStrictEqual(replayed, subject.currentBoard)) {
        return [];
    }

    const differing = [];
    if (replayed.seq !== subject.currentBoard.seq) {
        differing.push(`seq ${replayed.seq} vs ${subject.currentBoard.seq}`);
    }
    const ids = new Set([...Object.keys(replayed.entities), ...Object.keys(subject.currentBoard.entities)]);
    for (const id of ids) {
        const left = replayed.entities[id];
        const right = subject.currentBoard.entities[id];
        if (!isDeepStrictEqual(left, right)) {
            differing.push(`entity ${id}: replayed ${JSON.stringify(left)} vs writer ${JSON.stringify(right)}`);
        }
    }
    return [`round-trip: apply(records) differs from currentBoard(): ${listed(differing)}`];
}

/** Check 1b: at every step, the records up to it replay to the writer's board at that decision (SPEC §19, W-32). */
function stepDriftProblems(subject) {
    if (subject.stepCaptures === undefined) {
        return [];
    }
    const board = emptyBoard();
    const differing = [];
    for (const record of subject.records) {
        try {
            applyRecord(board, record);
        } catch (error) {
            return [];  // reported by the round-trip check
        }
        if (record.t !== 'step') {
            continue;
        }
        const capture = subject.stepCaptures[record.seq];
        if (capture === undefined) {
            differing.push(`step ${record.seq}: no board was captured`);
            continue;
        }
        if (!isDeepStrictEqual(board, capture.board)) {
            const ids = new Set([...Object.keys(board.entities), ...Object.keys(capture.board.entities)]);
            const entities = [...ids].filter((id) => !isDeepStrictEqual(board.entities[id], capture.board.entities[id]));
            differing.push(`step ${record.seq}: entities ${entities.slice(0, MAX_LISTED).join(', ') || '(none; seq)'} differ`);
        }
    }
    return differing.length > 0 ? [`step drift: apply(records) up to a step differs from the writer's board there: ${listed(differing)}`] : [];
}

/** Check 2: every view validates. */
function validityProblems(subject) {
    const problems = [];
    for (const view of VIEWS) {
        const report = validate(subject.files[String(view)]);
        if (report.level !== 'valid') {
            problems.push(`valid: validate(fileFor(${view})) is ${report.level}: ${listed(report.issues.map((issue) => `${issue.code} (line ${issue.line}): ${issue.message}`))}`);
        }
    }
    return problems;
}

/** Check 3: every attribute the records put on an entity is registered for that entity's kind. */
function registryProblems(subject) {
    const board = emptyBoard();
    const offenders = new Set();
    for (const record of subject.records) {
        try {
            applyRecord(board, record);
        } catch (error) {
            return [];  // reported by the round-trip check
        }
        if (record.t !== 'create' && record.t !== 'set') {
            continue;
        }
        const id = String(record.e);
        const entity = board.entities[id];
        const kinds = kindsOf(id, entity);
        for (const name of Object.keys(entity.a)) {
            const on = ATTRIBUTE_ON.get(name);
            if (on === undefined) {
                offenders.add(`'${name}' is not in the registry (entity ${id})`);
            } else if (!(name === 'kind' && kinds.includes('effect')) && !kinds.some((kind) => on.has(kind))) {
                offenders.add(`'${name}' is not allowed on ${kinds.join('/')} (entity ${id}; on ${[...on].join('|')})`);
            }
        }
    }
    return offenders.size > 0 ? [`registry: ${listed([...offenders])}`] : [];
}

/**
 * Check 4: in each view's final board, a card identity in a hand, resource row or deck that the view's seat does not
 * own (any deck card, owned or not; every one in the public view) is one the reveal log says was shown to it.
 * Entities carry no id the engine knows, so the check compares counts per owner, zone and card id.
 */
function leakProblems(subject) {
    const problems = [];
    for (const view of [1, 2, 'public']) {
        const visible = (owner, zone) => zone === 'deck' || view === 'public' || owner !== view;
        let board;
        try {
            board = apply(parse(subject.files[String(view)]).records);
        } catch (error) {
            continue;   // reported by the validity check
        }

        const named = new Map();
        for (const entity of Object.values(board.entities)) {
            if (entity.card === undefined || !HIDDEN_ZONES.has(entity.zone) || !visible(entity.owner, entity.zone)) {
                continue;
            }
            const key = `${entity.card} in p${entity.owner}'s ${entity.zone}`;
            named.set(key, (named.get(key) ?? 0) + 1);
        }
        if (named.size === 0) {
            continue;
        }

        const shown = new Map();
        for (const card of subject.hiddenCards) {
            const seen = view === 'public' ? card.seenBy.length === SEATS.length : card.seenBy.includes(view);
            if (seen) {
                const key = `${card.card} in p${card.owner}'s ${card.zone}`;
                shown.set(key, (shown.get(key) ?? 0) + 1);
            }
        }

        const leaks = [];
        for (const [key, count] of named) {
            const allowed = shown.get(key) ?? 0;
            if (count > allowed) {
                leaks.push(`${key}: ${count} named, ${allowed} shown`);
            }
        }
        if (leaks.length > 0) {
            problems.push(`leak: fileFor(${view}) names hidden cards its viewer was not shown: ${listed(leaks)}`);
        }
    }
    return problems;
}

/** The count of each `<card> in p<owner>'s <zone>` key over the cards that `include` accepts. */
function countByKey(cards, include) {
    const counts = new Map();
    for (const card of cards) {
        if (include(card)) {
            const key = `${card.card} in p${card.owner}'s ${card.zone}`;
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
    }
    return counts;
}

/**
 * Check 4b: at every step, each view names, in a hand, resource row or deck hidden from its seat, only card identities
 * the engine's own per-seat state had shown that seat by then and that it had not lost track of since (SPEC §19,
 * W-43, W-44, R-17). The public view is held to what both seats were shown.
 */
function stepLeakProblems(subject) {
    if (subject.stepCaptures === undefined) {
        return [];
    }
    const problems = [];
    for (const view of [1, 2, 'public']) {
        const hiddenFromView = (owner, zone) => zone === 'deck' || view === 'public' || owner !== view;
        let records;
        try {
            records = parse(subject.files[String(view)]).records;
        } catch (error) {
            continue;   // reported by the validity check
        }

        const board = emptyBoard();
        const leaks = [];
        for (const record of records) {
            try {
                applyRecord(board, record);
            } catch (error) {
                break;  // reported by the validity check
            }
            if (record.t !== 'step') {
                continue;
            }
            const capture = subject.stepCaptures[record.seq];
            if (capture === undefined) {
                continue;   // reported by the drift check
            }
            const named = countByKey(
                Object.values(board.entities)
                    .filter((entity) => entity.card !== undefined && HIDDEN_ZONES.has(entity.zone))
                    .map((entity) => ({ card: entity.card, owner: entity.owner, zone: entity.zone })),
                (card) => hiddenFromView(card.owner, card.zone)
            );
            const seen = view === 'public'
                ? (uuid) => SEATS.every((seat) => capture.shown[seat].has(uuid))
                : (uuid) => capture.shown[view].has(uuid);
            const allowed = countByKey(capture.hidden, (card) => seen(card.uuid));
            for (const [key, count] of named) {
                if (count > (allowed.get(key) ?? 0)) {
                    leaks.push(`step ${record.seq}: ${key}: ${count} named, ${allowed.get(key) ?? 0} shown`);
                }
            }
        }
        if (leaks.length > 0) {
            problems.push(`step leak: fileFor(${view}) names hidden cards the engine had not shown its seat: ${listed(leaks)}`);
        }
    }
    return problems;
}

/** Check 5: the writer counted no error. */
function errorProblems(subject) {
    return subject.errors === 0 ? [] : [`errors: the writer counted ${subject.errors} error(s)`];
}

/**
 * Runs every check over a subject (hand-built in the checker's spec, or `swuPgnSubjectOf` a game).
 * @param {SwuPgnRoundTripSubject} subject
 * @returns {string[]} the problems found; empty means OK
 */
function checkSwuPgnSubject(subject) {
    return [
        ...roundTripProblems(subject),
        ...stepDriftProblems(subject),
        ...validityProblems(subject),
        ...registryProblems(subject),
        ...leakProblems(subject),
        ...stepLeakProblems(subject),
        ...errorProblems(subject),
        ...(subject.logProblems ?? [])
    ];
}

/**
 * Every check over the game's writer. A game with no writer (`SWUPGN_WRITER=off`) has nothing to check.
 * @returns {string[]} the problems found; empty means OK
 */
function checkSwuPgnRoundTrip(game, revealLog, stepRecorder) {
    if (game?.swuPgnWriter == null) {
        return [];
    }
    return checkSwuPgnSubject(swuPgnSubjectOf(game, revealLog, stepRecorder));
}

module.exports = { RevealLog, StepRecorder, checkSwuPgnRoundTrip, checkSwuPgnSubject, swuPgnSubjectOf };
