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

export interface IPhaseSnapshotSettings extends ISnapshotSettingsBase {
    type: SnapshotType.Phase;
    phaseName: PhaseName;
}

export interface IPlayerSnapshotSettings extends ISnapshotSettingsBase {
    type: SnapshotType.Player;
    playerId: string;
}

export interface IRoundSnapshotSettings extends ISnapshotSettingsBase {
    type: SnapshotType.Round;
}

export type ISnapshotSettings = IActionSnapshotSettings | IPhaseSnapshotSettings | IPlayerSnapshotSettings | IRoundSnapshotSettings;

export type IGetSnapshotSettings = ISnapshotSettings & {

    /**
     * Optional offset to indicate how far back in the list to go. Most recent is -1, second most recent is -2, etc.
     *
     * Defaults to -1 (most recent).
     */
    offset?: number;
};

export interface IGameSnapshot {
    id: number;
    lastGameObjectId: number;

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
}