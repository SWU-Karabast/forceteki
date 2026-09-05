export type Seat = 1 | 2;

/**
 * Unit or upgrade, for readers deciding whether something occupies an arena. An `'upgrade'`
 * attaches to a unit and is NEVER a member of `ground`/`space`.
 *
 * The same field name means two things (spec §10.1): on an EVENT (`MOVE`, `CREATE_TOKEN`) it
 * is the ROLE that event enacts; in `%%% CARDS` it is the card's printed IDENTITY. A pilot is
 * a `'unit'` card whose move onto a vehicle is an `'upgrade'` move.
 */
export type CardKind = 'unit' | 'upgrade';

export interface Header {
    game: string;            // "SWU-PGN/1.0"
    gameId: string;
    date: string;            // ISO-8601 UTC
    format?: string;
    cardPool: string;        // set/legality version, e.g. "LOF"
    engine: string;          // "forceteki@2.3.1"
    seed: string;
    perspective: 'P1' | 'P2' | null;
    p1Id: string;            // "sha256:<salted>"
    p2Id: string;
    p1: string;              // display label, anonymized: "Player 1"
    p2: string;
    p1Leader: string; p1Base: string; p2Leader: string; p2Base: string;
    result: 'P1' | 'P2' | 'Draw' | 'Incomplete';
    reason: string;
    rounds: number;

    /** How many recorder handlers failed while writing this game. Absent means none: the
     *  file is complete. Present means events were dropped and the keyframes are the only
     *  fully trustworthy boundaries. */
    recorderErrors?: number;
}

export interface DeckRecord {
    p: Seat;
    leader: string;
    base: string;
    deck: [string, number][];       // [SET#NUM, count]
    sideboard?: [string, number][];
}

export interface SetupInitRecord {
    seq: string;                    // "R1.S.0"
    t: 'INIT';
    p1DeckOrder: string[];
    p2DeckOrder: string[];
}

/**
 * Discriminated union of all event record types. `t` is the discriminant.
 *
 * Two members carry fields that are easy to misread:
 *
 * - `DEPLOY_LEADER.kind` + `target` are set together when the leader deployed AS A PILOT: the
 *   deploy attaches it to `target` as an upgrade instead of placing a body in the arena.
 * - `TAKE_CONTROL`: `p` took control of `card`. A control change is not a zone change, so no
 *   MOVE accompanies it and the fold re-seats the card itself. `zone` is where the card is
 *   now — `ground`/`space` (re-seat a unit), `resource` (shift one resource; `exhausted` says
 *   which bucket) or `base` (a Credit or Force token changed hands); `from` is the seat it
 *   left, present only when this record (and not a MOVE beside it) has to carry the counts.
 * - `EXHAUST_RESOURCES` / `READY_RESOURCES`: resources are counted, never named. `amount` ready
 *   resources of `p` became exhausted (a cost paid, an ability, a resource that entered the row
 *   exhausted), or `amount` exhausted ones became ready (the regroup step readies each one; some
 *   abilities ready several). A reader clamps to what it has.
 * - `CAPTURE`: `p` captured `card` with `by` (a unit id, or `base@N` for a base captor). `p` is
 *   the captor's controller — the seat that holds the card from now on. `RESCUE`: `card`
 *   returned to play under `p`, its owner; the paired `MOVE` out of `capture` places it.
 */
export type GameEvent =
  | { seq: string; t: 'PLAY' | 'PLAY_EVENT' | 'PLAY_UPGRADE' | 'PLAY_SMUGGLE'; p: Seat; card: string; zone?: string; cost?: number; target?: string }
  | { seq: string; t: 'DEPLOY_LEADER'; p: Seat; card: string; zone?: string; cost?: number; kind?: CardKind; target?: string }
  | { seq: string; t: 'ATTACK'; p: Seat; atk: string; def: string; defenderType: 'unit' | 'base' }
  | { seq: string; t: 'PASS' | 'CLAIM_INITIATIVE'; p: Seat }
  | { seq: string; t: 'CHOICE'; p: Seat; prompt?: string; offered: string[]; chose: number }
  | { seq: string; t: 'MULLIGAN' | 'KEEP_HAND'; p: Seat }
  | { seq: string; t: 'MODAL_CHOICE'; p: Seat; offered: string[]; chose: number }
  | { seq: string; t: 'ABILITY_ACTIVATE'; p: Seat; card: string; ability?: string }
  | { seq: string; t: 'DAMAGE'; src: string; tgt: string; amt: number; damageType: string; hp: number }
  | { seq: string; t: 'HEAL'; tgt: string; amt: number; hp: number }
  | { seq: string; t: 'DEFEAT'; card: string; reason: string; defeatedBy?: string }
  | { seq: string; t: 'EXHAUST' | 'READY'; card: string }
  | { seq: string; t: 'EXHAUST_RESOURCES' | 'READY_RESOURCES'; p: Seat; amount: number }
  | { seq: string; t: 'DRAW'; p: Seat; count: number; cards: string[] }
  | { seq: string; t: 'DISCARD'; p: Seat; cards: string[] }
  | { seq: string; t: 'RESOURCE'; p: Seat; card: string }
  | { seq: string; t: 'SHUFFLE'; p: Seat }
  | { seq: string; t: 'CREATE_TOKEN'; p: Seat; token: string; zone: string; power?: number; hp?: number; kind?: CardKind }
  | { seq: string; t: 'CAPTURE'; p: Seat; card: string; by?: string }
  | { seq: string; t: 'RESCUE'; p: Seat; card: string }
  | { seq: string; t: 'TAKE_CONTROL'; p: Seat; card: string; zone?: string; from?: Seat; exhausted?: boolean }
  | { seq: string; t: 'SHIELD_GAIN' | 'SHIELD_USE'; card: string; count?: number }
  | { seq: string; t: 'EXPERIENCE_GAIN'; card: string; count: number }
  | { seq: string; t: 'STATUS_TOKEN'; card: string; token: string; count: number }
  | { seq: string; t: 'OVERWHELM'; p: Seat; tgt: string; amt: number; hp: number }
  | { seq: string; t: 'SEARCH'; p: Seat; found?: string[]; zone?: string }
  | { seq: string; t: 'REVEAL'; p: Seat; zone: string; cards: string[] }
  | { seq: string; t: 'TRIGGER'; p?: Seat; card: string }
  | { seq: string; t: 'PHASE_START' | 'PHASE_END'; phase: string }
  | { seq: string; t: 'ROUND_START' | 'ROUND_END'; round: number; keyframe?: ReducedState }
  | { seq: string; t: 'GAME_END'; winner: Seat | 'Draw'; reason: string }
  | {
      seq: string; t: 'MOVE'; card: string; from: string; to: string; p?: Seat;

      /** The host this move attaches the card to. Present only on the move INTO an arena that
       *  attaches; a move out of an arena never names a host — a reader detaches on the zone
       *  transition (spec §10.1). */
      attachedTo?: string;

      /** On a move out of `resource` only: the card left the row exhausted, so the fold takes it
       *  from `resourcesExhausted` rather than `resourcesReady`. Absent means it left ready. */
      exhausted?: boolean;

      /**
       * The ROLE this move enacts, not what the card is: a pilot flown onto a vehicle is an
       * `'upgrade'` move of a unit card. Emitted whenever determinable, because a reader cannot
       * tell otherwise: Shield, Experience, Advantage and Weakness are token-UPGRADES and must
       * never enter an arena, while Battle Droid, X-Wing, TIE Fighter, Clone Trooper, Mandalorian,
       * Spy and Beast are token-UNITS and must. Both arrive as `TOKEN:<name>#<id>`, so without
       * this a reader is guessing, and a hardcoded list of upgrade names breaks the day a new
       * token upgrade is printed. Absent: the fold treats the move as a unit move.
       */
      kind?: CardKind;
    };

export interface Annotation {
    ref: string;                    // seq this annotates
    nag?: string;                   // chess-style glyph: "!", "?", "!!", "?!", ...
    text?: string;
    by?: string;                    // pseudonymous author
    line?: GameEvent[];             // engine-free variation
    id?: string;                    // stable, opaque; lets another note reply to this one (spec §15)
    parent?: string;                // the `id` this note replies to; absent for a top-level note
    ts?: number;                    // epoch milliseconds; orders a thread
}

/**
 * One entry of the `%%% CARDS` index: a card identifier and the name to show for it.
 *
 * The index makes a file self-describing. Without it every `SET#NUM` in the file is opaque
 * to a human and unresolvable to a reader that has no card database — which is what forced
 * `render()` to take an injected NameResolver.
 *
 * Ids here are BASE ids: no `:N` copy suffix (look up `baseId(ref)`), because every copy of
 * a card shares a name.
 */
export interface CardIndexRecord {
    id: string;                     // SET#NUM, or TOKEN:<name>#<id>
    name: string;                   // display name, e.g. "Greef Karga, Gracious Magistrate"
    /** What this card IS, by printed type (an IDENTITY, unlike the per-event role). Lets a
     *  reader classify by id alone — in particular, which `TOKEN:` ids are upgrades and which
     *  are units. Absent means neither: an Event, a base, an undeployed leader. */
    kind?: CardKind;
}

export interface SwuPgnDocument {
    header: Header;

    /** `%%% STORY`: the rendered narrative, as raw text lines. Derived from the rest of the
     *  file, and a convenience only — `events` is always the truth. Its exact wording is
     *  ADVISORY: a renderer may word lines differently without breaking the format, so a
     *  reader that re-renders and gets different prose must not reject the file. Optional;
     *  `parse()` always sets it. */
    story?: string[];
    decks: DeckRecord[];

    /** `%%% CARDS`: id -> display name for every card the file mentions. Optional: without it
     *  a reader needs its own card database to show names. `parse()` always sets it. */
    cards?: CardIndexRecord[];
    setup: (SetupInitRecord | GameEvent)[];
    events: GameEvent[];
    annotations: Annotation[];
}

// ----- Reduced (folded) state -----

export interface CardInstanceState {
    id: string;                     // SET#NUM[:copy]
    zone: string;
    damage: number;
    exhausted: boolean;

    /** Printed cards attached to this one: upgrades and pilots. Token upgrades are never
     *  listed here — they are the three counters below. */
    upgrades: string[];
    shields: number;
    experience: number;

    /** Every other token upgrade, by token name: `{ advantage: 2, weakness: 1 }`. */
    statusTokens: Record<string, number>;

    /** Enemy units this one holds captured, by id. Absent in files written before it existed;
     *  a reader treats absent as `[]`. */
    captured: string[];

    /** Current power/HP as the engine computed them, INCLUDING ability effects. Snapshot-only:
     *  present in keyframes, never maintained by the fold (which has no rules engine), and
     *  not compared by `checkKeyframes`. A reader may use them to correct its own arithmetic
     *  at every round boundary. */
    power?: number;
    hp?: number;
}

export interface PlayerState {
    seat: Seat;
    baseHp: number;
    baseMaxHp: number;
    handSize: number;
    hand: string[];                 // known post-game (omniscient archive)
    resourcesReady: number;
    resourcesExhausted: number;
    credits: number;
    hasForce: boolean;
    discard: string[];
    cards: CardInstanceState[];     // units/upgrades in play
}

export interface ReducedState {
    round: number;
    phase: 'setup' | 'action' | 'regroup';
    initiative: Seat | null;
    players: Partial<Record<Seat, PlayerState>>;
}

export interface ConformanceIssue {
    severity: 'error' | 'warning';
    line?: number;
    message: string;
}

export interface ConformanceReport {
    valid: boolean;
    formatVersion: string | null;
    issues: ConformanceIssue[];
}
