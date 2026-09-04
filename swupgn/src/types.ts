export type Seat = 1 | 2;

/**
 * What a card is, for readers deciding whether it occupies an arena.
 * An `'upgrade'` attaches to a unit and is NEVER a member of `ground`/`space`.
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

/** Discriminated union of all event record types. `t` is the discriminant. */
export type GameEvent =
  | { seq: string; t: 'PLAY' | 'PLAY_EVENT' | 'PLAY_UPGRADE' | 'PLAY_SMUGGLE'; p: Seat; card: string; zone?: string; cost?: number; target?: string }
  | { seq: string; t: 'DEPLOY_LEADER'; p: Seat; card: string; zone?: string; cost?: number }
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
  | { seq: string; t: 'DRAW'; p: Seat; count: number; cards: string[] }
  | { seq: string; t: 'DISCARD'; p: Seat; cards: string[] }
  | { seq: string; t: 'RESOURCE'; p: Seat; card: string }
  | { seq: string; t: 'SHUFFLE'; p: Seat }
  | { seq: string; t: 'CREATE_TOKEN'; p: Seat; token: string; zone: string; power?: number; hp?: number; kind?: CardKind }
  | {
      seq: string; t: 'MOVE'; card: string; from: string; to: string; p?: Seat; attachedTo?: string;
      /**
       * What the moving card IS. Emitted whenever it is determinable, because a reader cannot
       * tell otherwise: Shield, Experience, Advantage and Weakness are token-UPGRADES and must
       * never enter an arena, while Battle Droid, X-Wing, TIE Fighter, Clone Trooper,
       * Mandalorian, Spy and Beast are token-UNITS and must. Both arrive as `TOKEN:<name>#<id>`,
       * so without this a reader is guessing — and a hardcoded list of upgrade names breaks the
       * day a new token upgrade is printed.
       */
      kind?: CardKind;
    }
  | { seq: string; t: 'CAPTURE' | 'RESCUE' | 'TAKE_CONTROL'; p: Seat; card: string }
  | { seq: string; t: 'SHIELD_GAIN' | 'SHIELD_USE'; card: string; count?: number }
  | { seq: string; t: 'EXPERIENCE_GAIN'; card: string; count: number }
  | { seq: string; t: 'STATUS_TOKEN'; card: string; token: string; count: number }
  | { seq: string; t: 'OVERWHELM'; p: Seat; tgt: string; amt: number; hp: number }
  | { seq: string; t: 'SEARCH'; p: Seat; found?: string[]; zone?: string }
  | { seq: string; t: 'REVEAL'; p: Seat; zone: string; cards: string[] }
  | { seq: string; t: 'TRIGGER'; p?: Seat; card: string }
  | { seq: string; t: 'PHASE_START' | 'PHASE_END'; phase: string }
  | { seq: string; t: 'ROUND_START' | 'ROUND_END'; round: number; keyframe?: ReducedState }
  | { seq: string; t: 'GAME_END'; winner: Seat | 'Draw'; reason: string };

export interface Annotation {
    ref: string;                    // seq this annotates
    nag?: string;                   // chess-style glyph: "!", "?", "!!", "?!", ...
    text?: string;
    by?: string;                    // pseudonymous author
    line?: GameEvent[];             // engine-free variation
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
    /** What this card is, when determinable. Lets a reader classify by id alone — in
     *  particular, which `TOKEN:` ids are upgrades and which are units. */
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
    upgrades: string[];
    shields: number;
    experience: number;
    statusTokens: Record<string, number>;
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
