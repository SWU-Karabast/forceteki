/**
 * Wire identifier for the SWU-PGN format, emitted verbatim in the `[Game]` header tag
 * of both files. Bump this (in coordination with the replay-viewer client, which keys
 * off it) whenever the format changes in a way a parser must be aware of.
 * The published JSON schema for replay records lives at docs/swu-pgn-replay.schema.json.
 */
export const PGN_FORMAT_VERSION = 'SWU-PGN v1.0';

/**
 * Action types for the machine-readable replay data.
 *
 * Values marked "active" have event listeners in PgnReplayRecorder.
 * Values marked "reserved" are defined for the format spec but do not yet
 * have listeners — they will be wired up as the corresponding game events
 * become available or are needed for replay fidelity.
 */
export enum PgnActionType {
    // Active — emitted by PgnReplayRecorder event listeners
    Play = 'PLAY',
    PlaySmuggle = 'PLAY_SMUGGLE',
    PlayUpgrade = 'PLAY_UPGRADE',
    PlayEvent = 'PLAY_EVENT',
    DeployLeader = 'DEPLOY_LEADER',
    Attack = 'ATTACK',
    Pass = 'PASS',
    ClaimInitiative = 'CLAIM_INITIATIVE',
    Trigger = 'TRIGGER',
    Damage = 'DAMAGE',
    Defeat = 'DEFEAT',
    Exhaust = 'EXHAUST',
    Ready = 'READY',
    Draw = 'DRAW',
    Discard = 'DISCARD',
    Resource = 'RESOURCE',
    Shuffle = 'SHUFFLE',
    CreateToken = 'CREATE_TOKEN',
    Capture = 'CAPTURE',
    Rescue = 'RESCUE',
    Heal = 'HEAL',
    TakeControl = 'TAKE_CONTROL',
    GameState = 'GAME_STATE',
    GameEnd = 'GAME_END',
    PhaseStart = 'PHASE_START',
    PhaseEnd = 'PHASE_END',
    RoundStart = 'ROUND_START',
    RoundEnd = 'ROUND_END',
    Search = 'SEARCH',
    Reveal = 'REVEAL',

    // Reserved — defined in format spec, listeners to be added
    Move = 'MOVE',
    ShieldGain = 'SHIELD_GAIN',
    ShieldUse = 'SHIELD_USE',
    ExperienceGain = 'EXPERIENCE_GAIN',
    StatusToken = 'STATUS_TOKEN',
    Mulligan = 'MULLIGAN',
    KeepHand = 'KEEP_HAND',
    ModalChoice = 'MODAL_CHOICE',
    AbilityActivate = 'ABILITY_ACTIVATE',
    Overwhelm = 'OVERWHELM',
}

export interface IPgnReplayRecordBase {
    seq: string;
    type: PgnActionType;
    player?: string;
}

export interface IPgnReplayRecord extends IPgnReplayRecordBase {
    [key: string]: string | number | boolean | string[] | Record<string, any> | undefined;
}

export interface IPgnCardIndexEntry {
    name: string;
    setId: string;
    count: number;
}

export interface IPgnPlayerDecklist {
    leader: IPgnCardIndexEntry;
    base: IPgnCardIndexEntry;
    deck: IPgnCardIndexEntry[];
    sideboard?: IPgnCardIndexEntry[];
}

export interface IPgnHeader {
    game: string;
    date: string;
    player1: string;
    player2: string;
    p1Leader: string;
    p1Base: string;
    p2Leader: string;
    p2Base: string;
    result: string;
    reason: string;
    format?: string;
    rounds?: string;
}

export interface IStructureMarker {
    messageIndex: number;
    type: 'round' | 'phase' | 'action' | 'subEvent' | 'gameState' | 'drawnCards' | 'resourcedCard';
    round?: number;
    phase?: string;
    actionNumber?: number;
    subEventLetter?: string;
    /** Player label: 'P1' or 'P2' */
    player?: string;
    /** Game state snapshot: present when type is 'gameState' */
    gameState?: IPgnGameStateSnapshot;
    /** Cards drawn: present when type is 'drawnCards' */
    drawnCards?: string[];
    /** Card resourced: present when type is 'resourcedCard' */
    resourcedCard?: string;
}

/** Snapshot of one player's state at a point in time */
export interface IPgnPlayerStateSnapshot {
    baseHp: number;
    baseMaxHp: number;
    handSize: number;
    resourcesReady: number;
    resourcesExhausted: number;
    resourcesTotal: number;
    credits: number;
    hasForce: boolean;
    hasInitiative: boolean;
    groundUnits: number;
    spaceUnits: number;
}

/** Snapshot of the full game state after an action */
export interface IPgnGameStateSnapshot {
    p1: IPgnPlayerStateSnapshot;
    p2: IPgnPlayerStateSnapshot;
}

/** Return type for game file generation — both human-readable and replay files */
export interface IGameFiles {
    /** Human-readable .swupgn file content */
    swuPgn: string;
    /** Machine-replay .swureplay file content */
    swuReplay: string;
}
