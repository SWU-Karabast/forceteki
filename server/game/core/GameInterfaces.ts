import type { GameMode } from '../../GameMode';
import type { Lobby } from '../../gamenode/Lobby';
import type { IGameStatisticsTracker } from '../../gameStatistics/GameStatisticsTracker';
import type { IUser } from '../../Settings';
import type { CardDataGetter } from '../../utils/cardData/CardDataGetter';
import type { Attack } from './attack/Attack';
import type { EventWindow } from './event/EventWindow';
import type { AbilityResolver } from './gameSteps/AbilityResolver';
import type { ActionWindow } from './gameSteps/ActionWindow';
import type { UiPrompt } from './gameSteps/prompts/UiPrompt';
import type { UndoMode } from './snapshot/SnapshotManager';
import * as Contract from './utils/Contract';

export interface GameConfiguration {
    id: string;
    owner: string;
    players: IUser[];
    spectators?: IUser[];
    allowSpectators: boolean;
    gameMode: GameMode;
    cardDataGetter: CardDataGetter;
    statsTracker: IGameStatisticsTracker;
    useActionTimer?: boolean;
    pushUpdate: () => void;
    buildSafeTimeout: (callback: () => void, delayMs: number, errorMessage: string) => NodeJS.Timeout;
    userTimeoutDisconnect: (userId: string) => void;
    undoMode?: UndoMode;
}

export interface ICurrentlyResolving {
    abilityResolver?: AbilityResolver;
    actionWindow?: ActionWindow;
    attack?: Attack;
    eventWindow?: EventWindow;
    openPrompt?: UiPrompt;
}

export function validateGameConfiguration(configuration: GameConfiguration): void {
    Contract.assertNotNullLike(configuration.id);
    Contract.assertNotNullLike(configuration.owner);
    Contract.assertNotNullLike(configuration.players);
    Contract.assertNotNullLike(configuration.gameMode);
    Contract.assertNotNullLike(configuration.cardDataGetter);
    Contract.assertNotNullLike(configuration.pushUpdate);
    Contract.assertNotNullLike(configuration.buildSafeTimeout);
    Contract.assertNotNullLike(configuration.userTimeoutDisconnect);
}

export interface GameOptions {
    router: Lobby;
}

export function validateGameOptions(options: GameOptions): void {
    Contract.assertNotNullLike(options.router);
}