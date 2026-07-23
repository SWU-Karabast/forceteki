export type Seat = 1 | 2;

export interface Header {
    game: string;            // "SWU-PGN/1.1"
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
    | { seq: string; t: 'RESOURCE'; p: Seat; card: string; cardName?: string }
    | { seq: string; t: 'SHUFFLE'; p: Seat }
    | { seq: string; t: 'CREATE_TOKEN'; p: Seat; token: string; zone: string; power?: number; hp?: number }
    | { seq: string; t: 'MOVE'; card: string; from: string; to: string; p?: Seat }
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

export interface SwuPgnDocument {
    header: Header;
    decks: DeckRecord[];
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
