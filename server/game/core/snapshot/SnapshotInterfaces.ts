import type { Card } from '../card/Card';
import type { PhaseName, SnapshotType } from '../Constants';
import type { GameObjectRef, IGameObjectBaseState } from '../GameObjectBase';
import type { Player } from '../Player';

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

export type IGetSnapshotSettings = ISnapshotSettings & {

    /**
     * Optional offset to indicate how far back in the list to go. 0 is current snapshot, -1 is the most recent snapshot before current, -2 is the previous snapshot, etc.
     *
     * Defaults to 0 (most recent / current snapshot).
     */
    offset?: number;
};

export interface IGameSnapshot {
    id: number;
    lastGameObjectId: number;
    actionNumber: number;
    roundNumber: number;
    phase: PhaseName;

    gameState: IGameState;
    states: IGameObjectBaseState[];
}

export interface IGameState {
    roundNumber: number;
    initialFirstPlayer: GameObjectRef<Player> | null;
    initiativePlayer: GameObjectRef<Player> | null;
    actionPhaseActivePlayer: GameObjectRef<Player> | null;
    isInitiativeClaimed: boolean;
    allCards: GameObjectRef<Card>[];
    actionNumber: number;
}