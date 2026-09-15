import type { GameMode } from '../../GameMode';
import type { Lobby } from '../../gamenode/Lobby';
import type { IUser } from '../../Settings';
import type { CardDataGetter } from '../../utils/cardData/CardDataGetter';
import type { Attack } from './attack/Attack';
import type { EventWindow } from './event/EventWindow';
import type { AbilityResolver } from './gameSteps/AbilityResolver';
import type { ActionWindow } from './gameSteps/ActionWindow';
import type { UiPrompt } from './gameSteps/prompts/UiPrompt';
import type { UndoMode } from './snapshot/SnapshotManager';
import { Contract } from './utils/Contract';

export interface GameConfiguration {
    id: string;
    owner: string;
    players: IUser[];
    spectators?: IUser[];
    allowSpectators: boolean;
    gameMode: GameMode;
    cardDataGetter: CardDataGetter;
    useActionTimer?: boolean;
    pushUpdate: () => void;
    buildSafeTimeout: (callback: () => void, delayMs: number, errorMessage: string) => NodeJS.Timeout;
    userTimeoutDisconnect: (userId: string) => void;
    undoMode?: UndoMode;

    /** Player ID who gets to choose who starts with initiative, or undefined for random selection */
    preselectedFirstPlayerId?: string;

    /** Callback to forfeit a Bo3 set when a player times out during a game. Only provided for Bo3 matches. */
    onBo3SetForfeit?: (losingPlayerId: string) => void;

    /**
     * Optional explicit RNG seed, for repro runs only. Production lobby flows must leave this
     * unset so each `Game` instance mints its own fresh seed (see `Game.randomSeed`); passing the
     * same seed into two live games would make one game's shuffles predictable from the other's.
     */
    seed?: string;

    /** Wired into `Game.armedSave.onFired`/`.onCleared` at construction -- see `IArmedSaveSurface`. */
    onArmedSaveFired?: (trigger: IArmedSaveRequestInfo) => void;
    onArmedSaveCleared?: () => void;
}

/** Info describing the moment a save was requested, or ultimately taken, at. */
export interface IArmedSaveRequestInfo {
    requestedAtActionNumber: number;
    requestedAtPhase: string;
}

export type RequestSaveOutcome =
  | { kind: 'refused' }
  | ({ kind: 'immediate' } & IArmedSaveRequestInfo)
  | { kind: 'armed' };

/**
 * `Game`'s save-request surface, nested under one non-function property rather than exposed as
 * individually-named `Game` members. `Lobby.onGameMessage` dispatches any client-sent `{type: 'game',
 * command}` message straight to `this.game[command]` with no allowlist, guarded only by `typeof
 * this.game[command] !== 'function'` -- a bare public method or callback field here would be directly
 * client-invocable (an unbounded, client-triggered `MatchSerializer.save` loop for `onFired`, and a
 * mid-resolution save for `checkTrigger`/`request`). `armedSave` itself is an object, not a function, so
 * the dispatcher's guard rejects `{command: 'armedSave'}` outright, and nothing inside it is reachable by
 * a single command-name lookup. See the implementation review finding `P2D-R1-01`.
 */
export interface IArmedSaveSurface {

    /** Called from `Lobby.submitReport` when a save-requesting bug report arrives. */
    request(): RequestSaveOutcome;

    /** Called once per action-window boundary by `ActionWindow`'s own per-instance latch. Idempotent. */
    checkTrigger(): void;

    /** Called on every clear condition (phase exit, game end, disconnect, rollback re-entry). Idempotent. */
    clear(): void;

    /**
     * Mutable (not fixed at construction): `Lobby.buildGameSettings()` wires these once via
     * `GameConfiguration`, and `ArmedSaveTrigger.spec.ts` reassigns them directly on `context.game.armedSave`
     * post-construction, since the test harness (`GameFlowWrapper`) builds `Game` with no callback
     * passthrough. Reassignable because they live one level inside the non-function `armedSave` container,
     * which itself stays `readonly`.
     */
    onFired?: (trigger: IArmedSaveRequestInfo) => void;
    onCleared?: () => void;
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