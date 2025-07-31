import type { Card } from '../card/Card';
import type { PhaseName, SnapshotType } from '../Constants';
import type { GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import type { Player } from '../Player';
import type { IRandomness } from '../Randomness';

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

export type ISnapshotSettings = IActionSnapshotSettings | IPhaseSnapshotSettings | IManualSnapshotSettings;

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

export type IGetSnapshotSettings = IGetActionSnapshotSettings | IGetManualSnapshotSettings | IGetPhaseSnapshotSettings;

export interface IGameSnapshot {
    id: number;
    lastGameObjectId: number;
    actionNumber: number;
    roundNumber: number;
    phase: PhaseName;
    gameState: IGameState;
    states: IGameObjectBaseState[];
    rngState: IRandomness['rngState'];
}

export interface IGameState {
    roundNumber: number;
    initialFirstPlayer: GameObjectRef<Player> | null;
    initiativePlayer: GameObjectRef<Player> | null;
    actionPhaseActivePlayer: GameObjectRef<Player> | null;
    isInitiativeClaimed: boolean;
    allCards: GameObjectRef<Card>[];
    actionNumber: number;
    readonly winnerNames: string[];
}