export type Seat = 1 | 2;

/**
 * Unit or upgrade, for readers deciding whether something occupies an arena. An `'upgrade'`
 * attaches to a unit (or, with Fortify, to a base) and is NEVER a member of `ground`/`space`.
 *
 * The same field name means THREE things, and they are disjoint. On an EVENT (`MOVE`,
 * `CREATE_TOKEN`, `DEPLOY_LEADER`) it is the ROLE that event enacts; in `%%% CARDS` it is the
 * card's printed IDENTITY (spec §10.1) -- a pilot is a `'unit'` card whose move onto a vehicle
 * is an `'upgrade'` move. On `ABILITY_ACTIVATE` it is neither: it is `AbilityKind` below, a
 * completely separate vocabulary. A reader MUST branch on `t` before it reads `kind`.
 */
export type CardKind = 'unit' | 'upgrade';

/**
 * What sort of ability an `ABILITY_ACTIVATE` reports (spec §10.1). Nothing to do with
 * `CardKind`, which shares the field name on other record types.
 *
 * `action` and `epic` are the player's own action for the turn and take their own step number;
 * every other kind is a consequence of something else and is a sub-step. `event` is an event
 * card's own ability, which follows the `PLAY_EVENT` that paid for it; `delayed` is an effect
 * set up earlier that comes due now.
 *
 * This alias is the ONE definition. The JSON Schema enum in `schema/event.schema.json` and the
 * §10.1 table in the spec must list exactly these values -- `types.spec.ts` asserts the schema
 * and this type agree, so a new kind cannot be added in only one of the two.
 */
export type AbilityKind =
  | 'action' | 'epic' | 'triggered' | 'keyword' | 'replacement' | 'constant'
  | 'event' | 'delayed';

/**
 * Why a card was defeated (spec §6.4). A CLOSED vocabulary: these are the engine's own
 * defeat-source kinds, and a reader is expected to switch on them.
 *
 * - `attack`   — combat damage from an attack. `defeatedBy` names the attacker.
 * - `ability`  — a card ability defeated it outright, or dealt the damage that did.
 * - `nonCombatDamage` — damage from something that is not an attack (an event, an ongoing effect).
 * - `uniqueRule` — the CR 8.9 uniqueness rule: a second copy of a unique card in play.
 * - `frameworkEffect` — the rules engine itself, with no card to blame: an upgrade whose host
 *   left play, a unit whose remaining HP fell to zero when an effect expired or was removed, or
 *   a leader unit that would have changed control (it is defeated instead).
 * - `unknown` — the writer could not resolve a cause. Should not appear in a healthy file.
 */
export type DefeatReason =
  | 'attack' | 'ability' | 'nonCombatDamage' | 'uniqueRule' | 'frameworkEffect' | 'unknown';

/**
 * How long a lasting or delayed effect lasts (spec §6.4, §10.1). Closed: a reader may branch on
 * it. A value from a newer minor version is read per §18 (kept, not understood).
 *
 * - `attack` / `phase` / `round` — a lasting effect (CR 7.7.3): "for this attack", "for this phase", "for this round".
 * - `whileSourceInPlay` — while the card that created it stays in play.
 * - `until` — "until X happens"; `untilText` on the EFFECT_START says what X is, in words.
 * - `delayed` — a delayed effect: it waits for a timing point or condition and then resolves (CR 7.7.4).
 * - `game` — for the rest of the game.
 */
export type EffectDuration = 'attack' | 'phase' | 'round' | 'whileSourceInPlay' | 'until' | 'delayed' | 'game';

/**
 * Why an effect, or some of its targets, ended (spec §6.4, §10.1). Closed, like `EffectDuration`.
 * `fired` is a delayed effect that resolved; `targetLeft` is the one a partial EFFECT_END carries.
 */
export type EffectEndReason = 'expired' | 'fired' | 'sourceLeft' | 'targetLeft' | 'cancelled';

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

    /** A newer minor version may add an outcome (§18); a reader treats one it does not know
     *  as `Incomplete`. The raw value is kept so a newer reader can still tell it apart. */
    result: 'P1' | 'P2' | 'Draw' | 'Incomplete' | (string & Record<never, never>);
    reason: string;
    rounds: number;

    /** How many recorder handlers failed while writing this game. Absent means none: the
     *  file is complete. Present means events were dropped and the keyframes are the only
     *  fully trustworthy boundaries. */
    recorderErrors?: number;
    undos?: number;

    /** Which revision of its writer produced the file. Bumped on every change a reader can
     *  observe, so two files with the same `game` version can be told apart. Absent on files
     *  written before the tag existed (the 1.0 pilot). */
    writerRevision?: number;

    /** When the game ENDED, ISO-8601 UTC. With `date` (when it started) this gives the game's
     *  duration, which is the only thing per-event timestamps would have bought. Absent when the
     *  writer could not tell -- an unfinished game, or a file written before this existed. */
    endDate?: string;

    /** The match this game belongs to: an opaque id, stable across the games of one Bo3. Lets a
     *  file that travels on its own -- shared, archived, attached to a bug report -- still say it
     *  was part of a match. Chess PGN carries `Round` for the same reason. */
    match?: string;

    /** Which game of that match this is, 1-based. Meaningless without `match`. */
    gameNumber?: number;
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
 *   the captor's controller — the seat that holds the card from now on. A unit captor holds it
 *   in its `captured`, a base captor in its seat's `baseCaptured`. `RESCUE`: `card`
 *   returned to play under `p`, its owner; the paired `MOVE` out of `capture` places it.
 * - `STATS`: an in-play unit's live power, HP and keywords as the engine computes them — ability
 *   effects, upgrades, Raid during an attack, all of it — written whenever they change. This is
 *   what lets a reader show a modified unit correctly without a rules engine: it never derives
 *   stats, it is told them. `keywords` is the sorted list of active keywords, a numeric one as
 *   `"raid 2"`; absent means the writer did not record keywords.
 * - `epic` on `DEPLOY_LEADER` / `ABILITY_ACTIVATE`: the ability used was an Epic Action, which
 *   the rules track as used/unused game state (CR 1.16).
 */
/**
 * `for` is legal on ANY record and is written by the writer, not the recorder: it names the
 * top-level action a record belongs to when that record was numbered BEFORE the action was
 * announced (spec §9.1). A reader groups an action with its steps on it; one that ignores it
 * loses nothing but the grouping.
 */
export interface ActionLink {
    for?: string;

    /**
     * Milliseconds from the header's `Date` to this record (spec §5.2, §9). Written ONLY on
     * numbered actions and on `ROUND_START` / `PHASE_START` — never on a lettered consequence,
     * which the engine resolves in the same instant as its action. Ignored by the fold.
     *
     * Relative and coarse on purpose: it answers "how long did this decision take", which is a
     * review question `Date` and `EndDate` cannot reach, and it is never a wall-clock time.
     */
    ms?: number;
}

export type GameEvent = ActionLink & (
  | { seq: string; t: 'PLAY' | 'PLAY_EVENT' | 'PLAY_UPGRADE' | 'PLAY_SMUGGLE'; p: Seat; card: string; zone?: string; cost?: number; target?: string }
  | { seq: string; t: 'DEPLOY_LEADER'; p: Seat; card: string; zone?: string; cost?: number; kind?: CardKind; target?: string; epic?: boolean }
  | { seq: string; t: 'ATTACK'; p: Seat; atk: string; def: string; defenderType: 'unit' | 'base' }
  | { seq: string; t: 'PASS' | 'CLAIM_INITIATIVE'; p: Seat }
  | { seq: string; t: 'CHOICE'; p: Seat; prompt?: string; offered: string[]; chose: number }
  | { seq: string; t: 'MULLIGAN' | 'KEEP_HAND'; p: Seat }
  // A player took a decision back. The records it retracted are GONE from the file -- a reader
  // folding the stream sees only what still stands -- so this note exists purely to say that a
  // retraction happened, and where it reached back to. It folds to NOTHING. `at` is the seq of
  // the first record that was dropped; this record's own seq is that one plus `-undo`, because
  // the recorder's counters were rewound too and the redo re-issues the original number.
  | { seq: string; t: 'UNDO'; at: string; by?: Seat }
  | { seq: string; t: 'MODAL_CHOICE'; p: Seat; offered: string[]; chose: number }
  // `kind` says what sort of ability this is, so a reader never has to guess from the shape of
  // `ability` (the engine's own identifier, which this format does not promise to keep stable).
  // `action` and `epic` are the player's own action for the turn and take their own step number;
  // every other kind is a consequence of something else and is a sub-step. `title` is the
  // ability's printable name. `grantedBy` names the card whose text GAVE `card` this ability
  // (a Fortify upgrade's "Attached base gains: ...", an upgrade's "Attached unit gains: ...");
  // absent when the ability is `card`'s own printed text.
  | {
      seq: string; t: 'ABILITY_ACTIVATE'; p: Seat; card: string; ability?: string;
      kind?: AbilityKind;
      title?: string; epic?: boolean; grantedBy?: string;
  }
  // A double-sided leader flipped in place (it never deploys). `onStartingSide` is the face
  // AFTER the flip -- an absolute value, not a toggle, so a dropped record cannot invert
  // every later face and a reader joining at a keyframe has something to apply.
  | { seq: string; t: 'LEADER_FLIP'; p: Seat; card: string; onStartingSide: boolean }
  | { seq: string; t: 'STATS'; card: string; power: number; hp: number; keywords?: string[] }
  // `src` is what dealt it: a card id or `base@N`. Absent only when the rules themselves dealt
  // the damage and no card is responsible (drawing from an empty deck).
  | { seq: string; t: 'DAMAGE'; src?: string; tgt: string; amt: number; damageType: string; hp: number }
  | { seq: string; t: 'HEAL'; src?: string; tgt: string; amt: number; hp: number }
  // `reason` is the one CLOSED vocabulary in the format (spec §6.4): it comes from the engine's
  // own fixed enum, and a reader is meant to switch on it.
  | { seq: string; t: 'DEFEAT'; card: string; reason: DefeatReason; defeatedBy?: string }
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
  | { seq: string; t: 'PHASE_START' | 'PHASE_END'; phase: string; active?: Seat }
  // `active` is REQUIRED on ROUND_START (the initiative holder; the schema and the `round-start-active`
  // check enforce it) but typed optional so a reader-side fixture need not carry it.
  | { seq: string; t: 'ROUND_START' | 'ROUND_END'; round: number; keyframe?: ReducedState; active?: Seat }
  | { seq: string; t: 'GAME_END'; winner: Seat | 'Draw'; reason: string }
  // A lasting or delayed effect began (spec §10.1): ONE record per effect as the card text states
  // it. `id` is `fx@N`; `src` the card (or `base@N`) whose ability created it; `p` the seat that
  // controls it; `targets` what it applies to, or `seat` for a player-wide effect. `ability`,
  // `text` and `untilText` are advisory and never folded.
  | {
      seq: string; t: 'EFFECT_START'; id: string; src: string; p: Seat; targets?: string[]; seat?: Seat;
      duration: EffectDuration; untilText?: string; ability?: string; text?: string;
  }
  // The effect ended. With `targets`, only those targets left it (a target left play) and the
  // effect stays active for the rest; once none are left it is gone. Without, it all ended.
  | { seq: string; t: 'EFFECT_END'; id: string; reason: EffectEndReason; targets?: string[] }
  | {
      seq: string; t: 'MOVE'; card: string; from: string; to: string; p?: Seat;

      /** The host this move attaches the card to: a unit id, or `base@N` for an upgrade with
       *  Fortify moving into `base`. Present only on the move that attaches; a move out never
       *  names a host — a reader detaches on the zone transition (spec §10.1). */
      attachedTo?: string;

      /** On a move into or out of `resource` only. Out: the card left the row exhausted, so the
       *  fold takes it from `resourcesExhausted` rather than `resourcesReady`. Into: the card
       *  entered the row exhausted (a regroup resource, CR 5.5.1.c), so the fold counts it in
       *  `resourcesExhausted`. Absent means ready. */
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
  });

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

    /** The name of the card's OTHER side, when it has a different one: a leader whose Leader
     *  Unit side is another card (Grand Moff Tarkin deploys as "The Death Star, Icon of
     *  Tyranny"), or a double-sided leader's flipped face (Chancellor Palpatine / Darth
     *  Sidious). `name` is always the printed FRONT, so an entry never depends on which side
     *  happened to be up when the file was written. Which side is up at a given moment is
     *  game state: `DEPLOY_LEADER`, the leader's move home, and `LEADER_FLIP` say. */
    backSideName?: string;
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

    /** Live power/HP as the engine computed them, INCLUDING ability effects. Set by `STATS`
     *  records and by keyframes; absent until the first `STATS` names the card (older files
     *  never do). */
    power?: number;
    hp?: number;

    /** Active keywords, sorted, a numeric one as `"raid 2"`. Same provenance as `power`. */
    keywords?: string[];
}

/**
 * A lasting or delayed effect that is active now (spec §11): what `EFFECT_START` said, less its
 * advisory words, with the targets a partial `EFFECT_END` removed already gone.
 */
export interface ActiveEffect {
    id: string;
    src: string;
    p: Seat;
    targets?: string[];
    seat?: Seat;
    duration: EffectDuration;
}

/** The leader card's status: where it is and whether it can still act. */
export interface LeaderState {
    id: string;                     // SET#NUM
    deployed: boolean;              // Leader Unit side in play (as a unit or a pilot upgrade)
    exhausted: boolean;             // the card's ready/exhausted flag, wherever it is
    epicActionUsed: boolean;        // CR 1.16: Epic Action status is game state
    // Double-sided leaders only (Chancellor Palpatine, TWI#017). Such a leader never deploys --
    // its Action flips it IN PLACE in the base zone, changing its title, aspects and traits --
    // so nothing else in the stream says which face is up. Absent on every other leader, and on
    // files written before LEADER_FLIP existed; absent means "not a double-sided leader, or not
    // recorded", never "back side".
    onStartingSide?: boolean;
}

export interface PlayerState {
    seat: Seat;
    baseHp: number;
    baseMaxHp: number;
    handSize: number;
    hand: string[];                 // known post-game (omniscient archive)
    resourcesReady: number;
    resourcesExhausted: number;

    /**
     * WHICH cards are in the resource row, in the order they were resourced. Reconstructable
     * because every MOVE names its card; the ready/exhausted SPLIT is not, which is why the two
     * counts above stay the authority on ready state. A reader showing the row needs both.
     * Absent on files written before this existed; absent means "not recorded", not "empty".
     */
    resources?: string[];

    /**
     * The BASE's Epic Action, spent or not. CR 1.16 counts Epic Action status as game state, and
     * a base can carry one as well as a leader -- 12 do (Tarkintown, Security Complex, Jedha City,
     * Dooku's Palace, ...). The leader's own is `LeaderState.epicActionUsed`; they are separate
     * abilities on separate cards and are tracked separately. Absent means "not recorded".
     */
    baseEpicActionUsed?: boolean;

    /**
     * PRINTED upgrades attached to this seat's BASE (a set: order is not part of the model, as
     * for a unit's `upgrades`). Only an upgrade
     * with Fortify ("Attach this to your base, not a unit") gets here; while it is attached the
     * base has whatever "Attached base gains: ..." gives it. A base upgrade is in play but in no
     * arena, so it is never in `cards`. Absent on files written before it existed; absent means
     * "not recorded", not "none".
     */
    baseUpgrades?: string[];

    /**
     * Enemy units this seat's BASE holds captured (a set). A base captures only through an
     * ability that says so ("Your base captures an enemy non-leader unit": Arrest), and a unit
     * captor's captives ride on its `captured` instead. Pushed by a `CAPTURE` whose `by` is
     * `base@N`, cleared when the card leaves `capture`. Absent on files written before it
     * existed; absent means "not recorded", not "none".
     */
    baseCaptured?: string[];

    /**
     * This seat's base has been defeated: set by a `DEFEAT` whose `card` is `base@N`. A base is
     * defeated when its damage reaches its HP, or outright by an ability that says "defeat a
     * base" (Grand Moff Tarkin, Tyrant of the Outer Rim) -- and then its HP is NOT zero, so a
     * reader cannot tell from `baseHp` alone. Absent means false: it is only ever written true,
     * and a defeated base ends the game.
     */
    baseDefeated?: boolean;
    credits: number;
    hasForce: boolean;
    discard: string[];
    cards: CardInstanceState[];     // units in play (upgrades ride on their host)

    /** Cards left in the deck. Absent in older files; the fold learns it from the first
     *  keyframe and keeps it by MOVE. */
    deckSize?: number;

    /** Absent in older files, and until the first keyframe: the fold learns the leader's id
     *  from a keyframe or a `DEPLOY_LEADER`. */
    leader?: LeaderState;
}

export interface ReducedState {
    round: number;
    phase: 'setup' | 'action' | 'regroup';
    initiative: Seat | null;

    /** The initiative counter's status (CR 1.16): `true` once a player has taken it this round,
     *  back to `false` when a round starts. Absent in older files. */
    initiativeTaken?: boolean;

    /**
     * Whose turn it is to act in the action phase.
     *
     * KEYFRAME-SUPPLIED, and the only field of this state that is. Deriving it from the action
     * stream means modelling passing and priority, which is exactly the rules knowledge the
     * format exists to spare a reader; and the engine has not chosen one yet when PHASE_START
     * fires, so the deltas cannot state it either. It is therefore exact at every keyframe -- a
     * round boundary, which is where a scrubber jumps -- and stale between them. It is not part
     * of the integrity gate for that reason (§14). Absent outside the action phase, and in files
     * written before it existed.
     */
    active?: Seat;
    players: Partial<Record<Seat, PlayerState>>;

    /**
     * The lasting and delayed effects active now, in the order they started (CR 1.16.1). Built by
     * `EFFECT_START` / `EFFECT_END` and carried by keyframes. Absent in files written before it
     * existed: absent means "not recorded", never "none".
     */
    effects?: ActiveEffect[];
}

export interface ConformanceIssue {
    severity: 'error' | 'warning';

    /** Stable id from the spec's error table (§24). Branch on this, never on `message`. */
    code: string;
    line?: number;
    message: string;
}

/**
 * The conformance levels of spec §2.1, each implying the one before: `malformed` did not parse;
 * `well-formed` parsed but has errors or is a pre-release file; `valid` passes every schema and
 * cross-record rule; `verified` also folds to every keyframe; `complete` also lost nothing.
 */
export type ConformanceLevel = 'malformed' | 'well-formed' | 'valid' | 'verified' | 'complete';

export interface ConformanceReport {

    /** No errors (warnings allowed). */
    valid: boolean;
    level: ConformanceLevel;
    formatVersion: string | null;
    issues: ConformanceIssue[];
}
