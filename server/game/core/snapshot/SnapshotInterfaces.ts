import type { PhaseName, RollbackRoundEntryPoint, RollbackSetupEntryPoint, SnapshotType } from '../Constants';
import type { IRandomness } from '../Randomness';
import type { SerializedStateRecord } from '../StateEncoding';

export interface ISnapshotSettingsBase {
    type: SnapshotType;
}

export interface IActionSnapshotSettings extends ISnapshotSettingsBase {
    type: SnapshotType.Action;
    playerId: string;
}

export interface IManualSnapshotSettings extends ISnapshotSettingsBase {
    type: SnapshotType.Manual;
    playerId: string;
}

export interface IPhaseSnapshotSettings extends ISnapshotSettingsBase {
    type: SnapshotType.Phase;
    phaseName: PhaseName;
}

export interface IQuickSnapshotSettings extends ISnapshotSettingsBase {
    type: SnapshotType.Quick;
    playerId: string;
}

export type ISnapshotSettings = IActionSnapshotSettings | IPhaseSnapshotSettings | IManualSnapshotSettings | IQuickSnapshotSettings;

export interface IGetActionSnapshotSettings extends IActionSnapshotSettings {

    /**
     * Optional offset to indicate how far back in the action history to go.
     * 0 is beginning of player's current / most recent action, -1 is the most recent snapshot before that, etc.
     *
     * Defaults to 0 (most recent / current snapshot).
     */
    actionOffset?: number;
}

export interface IGetManualSnapshotSettings extends IManualSnapshotSettings {
    snapshotId: number;
}

export interface IGetPhaseSnapshotSettings extends IPhaseSnapshotSettings {

    /**
     * Optional offset to indicate how far back in the phase history to go.
     * 0 is beginning of current / most recent phase, -1 is the most recent snapshot before that, etc.
     *
     * Defaults to 0 (most recent / current snapshot).
     */
    phaseOffset?: number;
}

export type IGetSnapshotSettings = IGetActionSnapshotSettings | IGetManualSnapshotSettings | IGetPhaseSnapshotSettings | IQuickSnapshotSettings;

interface IRollbackResultBase {
    success: boolean;
}

export enum RollbackEntryPointType {
    Setup = 'setup',
    Round = 'round',
}

export interface IRollbackSetupEntryPoint {
    type: RollbackEntryPointType.Setup;
    entryPoint: RollbackSetupEntryPoint;
}

export interface IRollbackRoundEntryPoint {
    type: RollbackEntryPointType.Round;
    entryPoint: RollbackRoundEntryPoint;
}

interface IRollbackResultSuccess extends IRollbackResultBase {
    success: true;
    entryPoint: IRollbackSetupEntryPoint | IRollbackRoundEntryPoint;
    rolledPastGameEnd: boolean;
}

interface IRollbackResultFailure extends IRollbackResultBase {
    success: false;
}

export interface ICanRollBackResult {
    requiresConfirmation: boolean;
    isSameTimepoint?: boolean;
}

export type IRollbackResult = IRollbackResultSuccess | IRollbackResultFailure;

export interface ISnapshotProperties {
    roundNumber: number;
    actionNumber: number;
    currentPhase: PhaseName;
    snapshotId: number;
    requiresConfirmationToRollback: boolean;
    timepoint: SnapshotTimepoint;
    timepointNumber: number;
    nextSnapshotIsSamePlayer?: boolean;
}

export enum SnapshotTimepoint {
    StartOfPhase = 'startOfPhase',
    EndOfPhase = 'endOfPhase',
    Action = 'action',
    Mulligan = 'mulligan',
    SetupResource = 'setupResource',
    RegroupResource = 'regroupResource',
    RegroupReadyCards = 'regroupReadyCards',
}

export interface IGameSnapshot {
    id: number;
    lastGameObjectId: number;
    actionNumber: number;
    roundNumber: number;
    phase: PhaseName;
    timepoint: SnapshotTimepoint;
    timepointNumber: number;
    activePlayerId?: string;

    /**
     * P3-PB2: plain JSON-safe records, not `v8` buffers. `states` maps each live GameObject's uuid to its
     * generated `serialize<Class>` record; `Game.state` is one of those entries, keyed by `game.state.uuid`.
     * The map is retained as-is and never mutated by a restore, so a snapshot can be rolled back to
     * repeatedly. P4-C: a value may be shared by reference with other retained snapshots (the snapshot build
     * reuses the previous snapshot's record for an object untouched since), so a record is never written after
     * it is placed in a map.
     */
    states: Record<string, SerializedStateRecord>;
    rngState: IRandomness['rngState'];

    requiresConfirmationToRollback: boolean;
    nextSnapshotIsSamePlayer?: boolean;
}

export enum QuickUndoAvailableState {
    NoSnapshotAvailable = 'noSnapshotAvailable',
    UndoRequestsBlocked = 'undoRequestsBlocked',
    FreeUndoAvailable = 'freeUndoAvailable',
    RequestUndoAvailable = 'requestUndoAvailable',
    WaitingForConfirmation = 'waitingForConfirmation',
}
