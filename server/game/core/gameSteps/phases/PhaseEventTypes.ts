import type { PhaseName } from '../../../core/Constants';
import type { IGameEventBase } from '../../../core/event/IGameEvent';

export interface IOnPhaseStartedEvent extends IGameEventBase {
    phase: PhaseName;
}

export interface IOnPhaseEndedEvent extends IGameEventBase {
    phase: PhaseName;
}

export interface IOnPhaseEndedCleanupEvent extends IGameEventBase {
    phase: PhaseName;
}
