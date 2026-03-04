import { EventEmitter } from 'events';

import { GameChat } from './chat/GameChat';
import type { MsgArg } from './chat/GameChat';
import { OngoingEffectEngine } from './ongoingEffect/OngoingEffectEngine';
import { Player } from './Player';
import { Spectator } from '../../Spectator';
import { AnonymousSpectator } from '../../AnonymousSpectator';
import { GamePipeline } from './GamePipeline';
import { SetupPhase } from './gameSteps/phases/SetupPhase';
import { ActionPhase } from './gameSteps/phases/ActionPhase';
import { RegroupPhase } from './gameSteps/phases/RegroupPhase';
import { SimpleStep } from './gameSteps/SimpleStep';
import MenuPrompt from './gameSteps/prompts/MenuPrompt';
import HandlerMenuPrompt from './gameSteps/prompts/HandlerMenuPrompt';
import GameOverPrompt from './gameSteps/prompts/GameOverPrompt';
import * as GameSystems from '../gameSystems/GameSystemLibrary';
import { GameEvent } from './event/GameEvent';
import { EventWindow, TriggerHandlingMode } from './event/EventWindow';
import { AbilityResolver } from './gameSteps/AbilityResolver';
import { AbilityContext } from './ability/AbilityContext';
import * as Contract from './utils/Contract';
import { cards } from '../cards/Index';

import {
    AlertType,
    EffectName,
    EventName,
    GameEndReason,
    GameErrorSeverity,
    PhaseName,
    RollbackRoundEntryPoint,
    RollbackSetupEntryPoint,
    SnapshotType,
    TokenCardName,
    TokenUpgradeName,
    TokenUnitName,
    WildcardCardType,
    WildcardZoneName,
    ZoneName
} from './Constants';
import type { TokenName, Trait } from './Constants';
import { StateWatcherRegistrar } from './stateWatcher/StateWatcherRegistrar';
import { DistributeAmongTargetsPrompt } from './gameSteps/prompts/DistributeAmongTargetsPrompt';
import HandlerMenuMultipleSelectionPrompt from './gameSteps/prompts/HandlerMenuMultipleSelectionPrompt';
import { DropdownListPrompt } from './gameSteps/prompts/DropdownListPrompt';
import type { IDropdownListPromptProperties } from './gameSteps/prompts/DropdownListPrompt';
import { UnitPropertiesCard } from './card/propertyMixins/UnitProperties';
import type { Card } from './card/Card';
import { GroundArenaZone } from './zone/GroundArenaZone';
import { SpaceArenaZone } from './zone/SpaceArenaZone';
import { AllArenasZone } from './zone/AllArenasZone';
import type { IAllArenasZoneCardFilterProperties, IAllArenasSpecificTypeCardFilterProperties } from './zone/AllArenasZone';
import * as EnumHelpers from './utils/EnumHelpers';
import { SelectCardPrompt } from './gameSteps/prompts/SelectCardPrompt';
import { DisplayCardsWithButtonsPrompt } from './gameSteps/prompts/DisplayCardsWithButtonsPrompt';
import { DisplayCardsForSelectionPrompt } from './gameSteps/prompts/DisplayCardsForSelectionPrompt';
import { DisplayCardsBasicPrompt } from './gameSteps/prompts/DisplayCardsBasicPrompt';
import { validateGameConfiguration, validateGameOptions } from './GameInterfaces';
import type { GameConfiguration, GameOptions, ICurrentlyResolving } from './GameInterfaces';
import type { GameObjectBase, GameObjectRef } from './GameObjectBase';
import * as Helpers from './utils/Helpers';
import type { CostAdjuster } from './cost/CostAdjuster';
import { logger } from '../../logger';
import { SnapshotManager, UndoMode } from './snapshot/SnapshotManager';
import { getAbilityHelper } from '../AbilityHelper';
import type { IAbilityHelper } from '../AbilityHelper';
import { PhaseInitializeMode } from './gameSteps/phases/Phase';
import { Randomness } from './Randomness';
import type { IRandomness } from './Randomness';
import { RollbackEntryPointType, QuickUndoAvailableState } from './snapshot/SnapshotInterfaces';
import type {
    IGameState,
    IGetSnapshotSettings,
    ICanRollBackResult,
    IRollbackSetupEntryPoint,
    IRollbackRoundEntryPoint
} from './snapshot/SnapshotInterfaces';
import type { Lobby } from '../../gamenode/Lobby';
import { GameStatisticsLogger } from '../../gameStatistics/GameStatisticsTracker';
import type { IGameStatisticsTracker } from '../../gameStatistics/GameStatisticsTracker';
import type { UiPrompt } from './gameSteps/prompts/UiPrompt';
import { PerGameUndoLimit, UnlimitedUndoLimit } from './snapshot/UndoLimit';
import type { UndoLimit } from './snapshot/UndoLimit';
import UndoConfirmationPrompt from './gameSteps/prompts/UndoConfirmationPrompt';
import type { AdditionalPhaseEffect } from './ongoingEffect/effectImpl/AdditionalPhaseEffect';
import { AttackRulesVersion } from './attack/AttackFlow';
import type { IStep } from './gameSteps/IStep';
import type { ITokenCard } from './card/propertyMixins/Token';
import type { IClientUIProperties, ISerializedGameState } from '../Interfaces';
import type {
    IDisplayCardsWithButtonsPromptProperties,
    IDisplayCardsSelectProperties,
    IDisplayCardsBasicPromptProperties,
    ISelectCardPromptProperties,
    IDistributeAmongTargetsPromptProperties,
    IStatefulPromptResults
} from './gameSteps/PromptInterfaces';
import type { GameMode } from '../../GameMode';
import type { CardDataGetter } from '../../utils/cardData/CardDataGetter';
import type { ITokenCardsData } from '../../utils/cardData/CardDataGetter';
import type { IUser } from '../../Settings';
import type { Deck } from '../../utils/deck/Deck';
import type { IGameObjectRegistrar } from './snapshot/GameStateManager';
import { createGameObject } from './GameObjectUtils';

export class Game extends EventEmitter {
    private _debug: { pipeline: boolean };
    private _experimental: Record<string, never>;

    // #region ──── State-backed Properties ────────────────────────────────────

    public get actionPhaseActivePlayer(): Player | null {
        return this.gameObjectManager.get(this.state.actionPhaseActivePlayer);
    }

    public set actionPhaseActivePlayer(value: Player | null) {
        this.state.actionPhaseActivePlayer = value?.getRef();
    }

    public get allCards() {
        return this.state.allCards.map((x) => this.getFromRef(x));
    }

    public get initialFirstPlayer(): Player | null {
        return this.gameObjectManager.get(this.state.initialFirstPlayer);
    }

    public set initialFirstPlayer(value: Player | null) {
        this.state.initialFirstPlayer = value?.getRef();
    }

    public get initiativePlayer(): Player | null {
        return this.gameObjectManager.get(this.state.initiativePlayer);
    }

    public set initiativePlayer(value: Player | null) {
        this.state.initiativePlayer = value?.getRef();
    }

    public get isInitiativeClaimed() {
        return this.state.isInitiativeClaimed;
    }

    public set isInitiativeClaimed(value: boolean) {
        this.state.isInitiativeClaimed = value;
    }

    public get roundNumber() {
        return this.state.roundNumber;
    }

    public set roundNumber(value: number) {
        Contract.assertNonNegative(value, 'Round number must be non-negative: ' + value);
        this.state.roundNumber = value;
    }

    public get actionNumber() {
        return this.state.actionNumber;
    }

    public set actionNumber(value: number) {
        Contract.assertNonNegative(value, 'Action number must be non-negative: ' + value);
        this.state.actionNumber = value;
    }

    public get winnerNames(): readonly string[] {
        return this.state.winnerNames;
    }

    public get currentPhase() {
        return this.state.currentPhase;
    }

    public set currentPhase(value: PhaseName | null) {
        this.state.currentPhase = value;
    }

    public get lastEventId() {
        return this.state.lastGameEventId;
    }

    public get prevActionPhasePlayerPassed(): boolean | null {
        return this.state.prevActionPhasePlayerPassed;
    }

    public set prevActionPhasePlayerPassed(value: boolean | null) {
        this.state.prevActionPhasePlayerPassed = value;
    }

    // #endregion

    // #region ──── Currently-resolving Properties ─────────────────────────────

    public get currentAbilityResolver() {
        return this.currentlyResolving.abilityResolver;
    }

    public set currentAbilityResolver(value: AbilityResolver | null) {
        this.currentlyResolving.abilityResolver = value;
    }

    public get currentActionWindow() {
        return this.currentlyResolving.actionWindow;
    }

    public set currentActionWindow(value: any) {
        this.currentlyResolving.actionWindow = value;
    }

    public get currentAttack() {
        return this.currentlyResolving.attack;
    }

    public set currentAttack(value: any) {
        this.currentlyResolving.attack = value;
    }

    public get currentEventWindow() {
        return this.currentlyResolving.eventWindow;
    }

    public set currentEventWindow(value: EventWindow | null) {
        this.currentlyResolving.eventWindow = value;
    }

    // #endregion

    // #region ──── Other Getters ──────────────────────────────────────────────

    public get isDebugPipeline() {
        return this._debug.pipeline;
    }

    public get snapshotManager(): SnapshotManager {
        return this._snapshotManager;
    }

    public get isUndoEnabled() {
        return this.snapshotManager.undoMode !== UndoMode.Disabled;
    }

    public get gameObjectManager(): IGameObjectRegistrar {
        return this._snapshotManager.gameObjectManager;
    }

    public get randomGenerator(): IRandomness {
        return this._randomGenerator;
    }

    public get lobbyId() {
        return this._router.id;
    }

    public get gameStepsSinceLastUndo() {
        return this.snapshotManager.gameStepsSinceLastUndo;
    }

    public get serializationFailure() {
        return this._serializationFailure;
    }

    public get messages() {
        return this.gameChat.messages;
    }

    public get actions() {
        return GameSystems;
    }

    // #endregion

    // #region ──── Instance Fields ────────────────────────────────────────────

    public readonly attackRulesVersion: AttackRulesVersion;
    private readonly _snapshotManager: SnapshotManager;
    private readonly _randomGenerator: IRandomness;
    private readonly _router: Lobby;

    public ongoingEffectEngine: OngoingEffectEngine;
    public abilityHelper: IAbilityHelper;
    public playersAndSpectators: Record<string, Player | Spectator>;
    public chatMessageOffsets: Map<string, number>;
    public gameChat: GameChat;
    public pipeline: GamePipeline;
    public id: string;
    public allowSpectators: boolean;
    private freeUndoLimit: UndoLimit;
    public owner: string;
    public started: boolean;
    public statsUpdated: boolean;
    public playStarted: boolean;
    public createdAt: Date;
    public preUndoStateForError: { gameState: ISerializedGameState; settings: IGetSnapshotSettings } | null;
    public undoConfirmationOpen: boolean;
    private _serializationFailure: boolean;
    private _lastAttackId: number;
    public playerHasBeenPrompted: Map<string, boolean>;
    public readonly buildSafeTimeoutHandler: (callback: () => void, delayMs: number, errorMessage: string) => NodeJS.Timeout;
    public readonly userTimeoutDisconnect: (userId: string) => void;
    public readonly preselectedFirstPlayerId: string | undefined;
    public manualMode: boolean;
    public gameMode: GameMode;
    public currentlyResolving: ICurrentlyResolving;
    public state: IGameState;
    public tokenFactories: Record<string, (player: Player, additionalProperties?: any) => ITokenCard> | null;
    public stateWatcherRegistrar: StateWatcherRegistrar;
    public cardDataGetter: CardDataGetter;
    public playableCardTitles: string[];
    public allNonLeaderCardTitles: string[];
    public readonly statsTracker: IGameStatisticsTracker;
    public clientUIProperties: IClientUIProperties;
    public spaceArena: SpaceArenaZone;
    public groundArena: GroundArenaZone;
    public allArenas: AllArenasZone;
    public startedAt?: Date;
    public finishedAt?: Date;
    public gameEndReason?: GameEndReason;
    private _actionsSinceLastUndo?: number;

    // #endregion

    public constructor(details: GameConfiguration, options: GameOptions) {
        super();

        Contract.assertNotNullLike(details);
        validateGameConfiguration(details);
        Contract.assertNotNullLike(options);
        validateGameOptions(options);

        this.attackRulesVersion = details.attackRulesVersion ?? AttackRulesVersion.CR6;
        this._snapshotManager = new SnapshotManager(this, details.undoMode);
        this._randomGenerator = new Randomness();
        this._router = options.router;

        this.ongoingEffectEngine = createGameObject(OngoingEffectEngine, this);
        this.abilityHelper = getAbilityHelper(this);

        this.playersAndSpectators = {};
        this.chatMessageOffsets = new Map();
        this.gameChat = new GameChat(details.pushUpdate);
        this.pipeline = new GamePipeline();
        this.id = details.id;
        this.allowSpectators = details.allowSpectators;

        this.freeUndoLimit = details.undoMode === UndoMode.Request
            ? new PerGameUndoLimit(1)
            : new UnlimitedUndoLimit();

        this.owner = details.owner;
        this.started = false;
        this.statsUpdated = false;
        this.playStarted = false;
        this.createdAt = new Date();
        this.preUndoStateForError = null;
        this.undoConfirmationOpen = false;
        this._serializationFailure = false;
        this._lastAttackId = -1;
        this.playerHasBeenPrompted = new Map();

        this.buildSafeTimeoutHandler = details.buildSafeTimeout;
        this.userTimeoutDisconnect = details.userTimeoutDisconnect;
        this.preselectedFirstPlayerId = details.preselectedFirstPlayerId;

        // Debug flags, intended only for manual testing, and should always be false. Use the debug methods to temporarily flag these on.
        this._debug = { pipeline: false };
        // Experimental flags, intended only for manual testing. Use the enable methods to temporarily flag these on during tests.
        this._experimental = {};

        this.manualMode = false;
        this.gameMode = details.gameMode;

        this.initializeCurrentlyResolving();

        this.state = {
            initialFirstPlayer: null,
            initiativePlayer: null,
            actionPhaseActivePlayer: null,
            roundNumber: 0,
            isInitiativeClaimed: false,
            allCards: [],
            actionNumber: 0,
            winnerNames: [],
            lastGameEventId: 0,
            currentPhase: null,
            prevActionPhasePlayerPassed: null,
            movedCards: []
        };

        this.tokenFactories = null;
        this.stateWatcherRegistrar = createGameObject(StateWatcherRegistrar, this);
        this.cardDataGetter = details.cardDataGetter;
        this.playableCardTitles = this.cardDataGetter.playableCardTitles;
        this.allNonLeaderCardTitles = this.cardDataGetter.allNonLeaderCardTitles;

        this.statsTracker = createGameObject(GameStatisticsLogger, this);

        this.initialiseTokens(this.cardDataGetter.tokenData);

        this.clientUIProperties = {};

        this.registerGlobalRulesListeners();

        // TODO TWIN SUNS
        Contract.assertArraySize(
            details.players, 2, `Game must have exactly 2 players, received ${details.players.length}: ${details.players.map((player) => player.id).join(', ')}`
        );

        details.players.forEach((player) => {
            this.playersAndSpectators[player.id] = createGameObject(
                Player,
                player.id,
                player,
                this,
                details.useActionTimer ?? false
            );
        });

        details.spectators?.forEach((spectator) => {
            this.playersAndSpectators[spectator.id] = new Spectator(spectator.id, spectator);
        });

        this.spaceArena = createGameObject(SpaceArenaZone, this);
        this.groundArena = createGameObject(GroundArenaZone, this);
        this.allArenas = createGameObject(AllArenasZone, this, this.groundArena, this.spaceArena);

        this.setMaxListeners(0);
    }

    /**
     * Reports errors from the game engine back to the router, optionally halting the game if the error is severe.
     */
    public reportError(error: Error, severity: GameErrorSeverity = GameErrorSeverity.Normal): void {
        this._router.handleError(this, error, severity);
    }

    /**
     * Reports that game state serialization failed.
     * Sends an error report and cleans up the game, as the game is now in an invalid state.
     */
    public reportSerializationFailure(error: Error): never {
        // if we've already seen a serialization failure, we may be in an infinite loop while try to report it, so just throw
        if (this._serializationFailure) {
            throw error;
        }

        this._serializationFailure = true;

        this._router.handleSerializationFailure(this, error);

        // we won't reach here, this is just to make TS happy about the return type
        throw error;
    }

    /**
     * Adds a message to the in-game chat e.g 'Jadiel draws 1 card'
     */
    public addMessage(message: string, ...args: MsgArg[]): void {
        this.gameChat.addMessage(message, ...args);
    }

    /**
     * Adds a message to in-game chat with a graphical icon
     */
    public addAlert(type: AlertType, message: string, ...args: MsgArg[]): void {
        this.gameChat.addAlert(type, message, ...args);
    }

    /**
     * Build a timeout that will log an error on failure and not crash the server process
     */
    public buildSafeTimeout(callback: () => void, delayMs: number, errorMessage: string): NodeJS.Timeout {
        return this.buildSafeTimeoutHandler(callback, delayMs, errorMessage);
    }

    public initializeCurrentlyResolving(): void {
        this.currentlyResolving = {
            abilityResolver: null,
            actionWindow: null,
            attack: null,
            eventWindow: null,
            openPrompt: null
        };
    }

    public getChatMessageOffset(participantId: string): number {
        return this.chatMessageOffsets.get(participantId) ?? 0;
    }

    /**
     * Returns gameChat log messages excluding player chat messages.
     */
    public getLogMessages(maxEntries: number = 100) {
        let filteredMessages = this.gameChat.messages.filter((messageEntry) => {
            const message = messageEntry.message;

            // Check if it's an alert message (these should be included)
            if (typeof message === 'object' && message !== null && 'alert' in message) {
                return true;
            }

            // We need this long check since the first element of message[0] can be String | String[] | object with type | []
            if (Array.isArray(message) && message.length > 0) {
                const firstElement = message[0];
                if (typeof firstElement === 'object' && firstElement && 'type' in firstElement && firstElement['type'] === 'playerChat') {
                    return false;
                }
            }
            return true;
        });

        if (maxEntries != null) {
            Contract.assertPositiveNonZero(maxEntries);
            filteredMessages = filteredMessages.slice(-maxEntries);
        }

        return filteredMessages;
    }

    /**
     * Checks if a player is a spectator
     */
    public isSpectator(player: Player | Spectator): player is Spectator {
        return player.constructor === Spectator;
    }

    /**
     * Checks if a player is a player
     */
    public isPlayer(player: Player | Spectator): player is Player {
        return !this.isSpectator(player);
    }

    /**
     * Checks whether a player/spectator is still in the game
     */
    public hasPlayerNotInactive(playerName: string): boolean {
        const player = this.playersAndSpectators[playerName];
        if (!player) {
            return false;
        }

        return !this.isPlayer(player) || !player.left;
    }

    /**
     * Get all cards captured by a player's units and base
     */
    public getAllCapturedCards(player: Player) {
        const cardsCapturedByUnits = this
            .getArenaUnits({ condition: (card) => card.owner === player })
            .flatMap((card) => card.capturedUnits);

        return cardsCapturedByUnits.concat(player.base.capturedUnits);
    }

    /**
     * Get all players (not spectators) in the game
     */
    public getPlayers(): Player[] {
        return Object.values(this.playersAndSpectators).filter((player): player is Player => this.isPlayer(player));
    }

    /**
     * Returns the Player object (not spectator) for a name
     */
    public getPlayerByName(playerName: string): Player {
        const player = this.getPlayers().find((player) => player.name === playerName);
        if (player) {
            return player;
        }

        throw new Error(`Player with name ${playerName} not found`);
    }

    /**
     * Returns the Player object for an id
     */
    public getPlayerById(playerId: string): Player {
        Contract.assertHasProperty(this.playersAndSpectators, playerId);

        const player = this.playersAndSpectators[playerId];
        Contract.assertNotNullLike(player, `Player with id ${playerId} not found`);
        Contract.assertTrue(this.isPlayer(player), `Player ${player.name} is a spectator`);

        return player;
    }

    /**
     * Attach the lobby user object to a player. This preserves authentication
     * information needed for end-of-game stats updates after the user may have
     * been removed from the lobby.
     */
    public attachLobbyUser(playerId: string, lobbyUser: any): void {
        const player = this.getPlayerById(playerId);
        player.setLobbyUser(lobbyUser);
    }

    /**
     * Get all players (not spectators) with the first player at index 0
     */
    public getPlayersInInitiativeOrder(): Player[] {
        return this.getPlayers().sort((a) => (a.hasInitiative() ? -1 : 1));
    }

    public getActivePlayer(): Player | null {
        return this.currentPhase === PhaseName.Action ? this.actionPhaseActivePlayer : this.initiativePlayer;
    }

    /**
     * Get all players and spectators in the game
     */
    public getPlayersAndSpectators(): Record<string, Player | Spectator> {
        return this.playersAndSpectators;
    }

    /**
     * Get all spectators in the game
     */
    public getSpectators(): Spectator[] {
        return Object.values(this.playersAndSpectators).filter((player): player is Spectator => this.isSpectator(player));
    }

    /**
     * Gets a player other than the one passed (usually their opponent)
     */
    public getOtherPlayer(player: Player): Player | undefined {
        return this.getPlayers().find((p) => {
            return p.name !== player.name;
        });
    }

    public registerGlobalRulesListeners(): void {
        UnitPropertiesCard.registerRulesListeners(this);
    }

    /**
     * Checks who the next legal active player for the action phase should be and updates activePlayer. If none available, sets it to null.
     */
    public rotateActivePlayer(): void {
        Contract.assertTrue(this.currentPhase === PhaseName.Action, `rotateActivePlayer can only be called during the action phase, instead called during ${this.currentPhase}`);
        if (!this.actionPhaseActivePlayer.opponent.passedActionPhase) {
            this.createEventAndOpenWindow(
                EventName.OnPassActionPhasePriority,
                null,
                { player: this.actionPhaseActivePlayer, actionWindow: this },
                TriggerHandlingMode.ResolvesTriggers,
                () => {
                    this.actionPhaseActivePlayer = this.actionPhaseActivePlayer.opponent;
                }
            );
        } else if (this.actionPhaseActivePlayer.passedActionPhase) {
            this.actionPhaseActivePlayer = null;
        }

        // by default, if the opponent has passed and the active player has not, they remain the active player and play continues
    }

    public setRandomSeed(seed: string): void {
        this._randomGenerator.reseed(seed);
    }

    public getNextAttackId(): number {
        this._lastAttackId++;
        return this._lastAttackId;
    }

    /**
     * Returns the card with matching uuid from either players 'in play' area.
     */
    public findAnyCardInPlayByUuid(cardId: string) {
        return this.getPlayers().reduce<Card | null>(
            (card, player) => {
                if (card) {
                    return card;
                }
                return player.findCardInPlayByUuid(cardId);
            },
            null
        );
    }

    /**
     * Returns the card with matching uuid from anywhere in the game
     */
    public findAnyCardInAnyList(cardId: string) {
        return this.allCards.find((card) => card.uuid === cardId);
    }

    /**
     * Returns all cards from anywhere in the game matching the passed predicate
     */
    public findAnyCardsInAnyList(predicate: (card: Card) => boolean) {
        return this.allCards.filter(predicate);
    }

    /**
     * Returns all cards which match the passed predicate from either players arenas
     */
    public findAnyCardsInPlay(predicate: (card: Card) => boolean = () => true) {
        return this.allArenas.getCards({ condition: predicate });
    }

    /**
     * Returns if a card is in play (units, upgrades, base, leader) that has the passed trait
     */
    public isTraitInPlay(trait: Trait | Trait[]): boolean {
        return this.getPlayers().some((player) => player.isTraitInPlay(trait));
    }

    public getArenaCards(filter: IAllArenasZoneCardFilterProperties = {}) {
        return this.allArenas.getCards(filter);
    }

    public getArenaUnits(filter: IAllArenasSpecificTypeCardFilterProperties = {}) {
        return this.allArenas.getUnitCards(filter);
    }

    public getArenaUpgrades(filter: IAllArenasSpecificTypeCardFilterProperties = {}) {
        return this.allArenas.getUpgradeCards(filter);
    }

    public hasSomeArenaCard(filter: IAllArenasZoneCardFilterProperties = {}): boolean {
        return this.allArenas.hasSomeCard(filter);
    }

    public hasSomeArenaUnit(filter: IAllArenasSpecificTypeCardFilterProperties = {}): boolean {
        return this.allArenas.hasSomeCard({ ...filter, type: WildcardCardType.Unit });
    }

    /**
     * Return the `Zone` object corresponding to the arena type
     */
    public getArena(arenaName: ZoneName.SpaceArena | ZoneName.GroundArena | WildcardZoneName.AnyArena) {
        switch (arenaName) {
            case ZoneName.GroundArena:
                return this.groundArena;
            case ZoneName.SpaceArena:
                return this.spaceArena;
            case WildcardZoneName.AnyArena:
                return this.allArenas;
            default:
                Contract.fail(`Unknown arena enum value: ${arenaName}`);
        }
    }

    public resetForNewTimepoint(): void {
        for (const player of this.getPlayers()) {
            player.hasResolvedAbilityThisTimepoint = false;
        }
    }

    public restartAllActionTimers(): void {
        this.getPlayers().forEach((player) => player.actionTimer.restartIfRunning());
    }

    public onPlayerAction(playerId: string): void {
        const player = this.getPlayerById(playerId);

        player.incrementActionId();
        player.actionTimer.restartIfRunning();
    }

    public onActionTimerExpired(player: Player): null {
        player.opponent.actionTimer.stop();

        this.userTimeoutDisconnect(player.id);
        this.addAlert(AlertType.Danger, '{0} has been removed due to inactivity.', player);
        return null;
    }

    // TODO: parameter contract checks for this flow
    /**
     * This function is called from the client whenever a card is clicked
     */
    public cardClicked(sourcePlayerId: string, cardId: string): void {
        const player = this.getPlayerById(sourcePlayerId);

        if (!player) {
            return;
        }

        const card = this.findAnyCardInAnyList(cardId);

        if (!card) {
            return;
        }

        // Check to see if the current step in the pipeline is waiting for input
        this.pipeline.handleCardClicked(player, card);
    }

    /**
     * Check to see if a base (or both bases) has been destroyed
     */
    public checkWinCondition(): void {
        const losingPlayers = this.getPlayers().filter((player) => player.base.damage >= player.base.getHp());
        if (losingPlayers.length === 1) {
            this.endGame(losingPlayers[0].opponent, GameEndReason.GameRules);
        } else if (losingPlayers.length === 2) { // draw game
            this.endGame(losingPlayers, GameEndReason.GameRules);
        }
    }

    /**
     * Display message declaring victory for one player, and record stats for the game
     */
    public endGame(winnerPlayers: Player[] | Player, reasonCode: GameEndReason): void {
        this.gameEndReason = reasonCode;

        if (this.state.winnerNames.length > 0) {
            // A winner has already been determined. This means the players have chosen to continue playing after game end. Do not trigger the game end again.
            return;
        }

        for (const player of this.getPlayers()) {
            player.actionTimer.stop();

            this.snapshotManager.setRequiresConfirmationToRollbackCurrentSnapshot(player.id);
        }

        /**
         * TODO we currently set the winner here as to send the winner via gameState.
         * TODO this will likely change when we decide on how the popup will look like separately
         * TODO from the preference popup
         */
        const winners = Helpers.asArray(winnerPlayers);
        if (winners.length > 1) {
            winners.forEach((w) => this.state.winnerNames.push(w.name));
            this.addMessage('The game ends in a draw');
        } else {
            this.state.winnerNames.push(winners[0].name);
            this.addMessage('{0} has won the game', winnerPlayers as any);
        }
        this.finishedAt = new Date();
        this._router.handleGameEnd();
        // TODO Tests failed since this._router doesn't exist for them we use an if statement to unblock.
        // TODO maybe later on we could have a check here if the environment test?
        if (typeof this._router.sendGameState === 'function') {
            this._router.sendGameState(this);
        } else {
            this.queueStep(new GameOverPrompt(this));
        }
    }

    /**
     * Changes a Player variable and displays a message in chat
     */
    public changeStat(playerId: string, stat: string, value: number): void {
        const player = this.getPlayerById(playerId);
        if (!player) {
            return;
        }

        const target: any = player;

        target[stat] += value;

        if (target[stat] < 0) {
            target[stat] = 0;
        } else {
            this.addMessage('{0} sets {1} to {2} ({3})', player, stat, target[stat], (value > 0 ? '+' : '') + value);
        }
    }

    /**
     * This function is called by the client every time a player enters a chat message
     */
    public chat(playerId: string, message: string): void {
        const player = this.getPlayerById(playerId);

        if (!player) {
            return;
        }

        if (!this.isSpectator(player)) {
            this.gameChat.addChatMessage(player, message);
        }
    }

    /**
     * This is called by the client when a player clicks 'Concede'
     */
    public concede(playerId: string): void {
        const player = this.getPlayerById(playerId);

        if (!player) {
            return;
        }

        this.addMessage('{0} concedes the game', player);

        const otherPlayer = this.getOtherPlayer(player);

        if (otherPlayer) {
            this.endGame(otherPlayer, GameEndReason.Concede);
        }
    }

    public selectDeck(playerId: string, deck: Deck): void {
        const player = this.getPlayerById(playerId);
        if (player) {
            player.selectDeck(deck);
        }
    }

    /**
     * Called when a player clicks Shuffle Deck on the deck menu in the client
     */
    public shuffleDeck(playerId: string): void {
        const player = this.getPlayerById(playerId);
        if (player) {
            player.shuffleDeck();
        }
    }

    public getCurrentOpenPrompt(): UiPrompt | null | undefined {
        return this.currentlyResolving.openPrompt;
    }

    public setCurrentOpenPrompt(currentPrompt: UiPrompt | null): void {
        if (currentPrompt) {
            for (const player of this.getPlayers()) {
                if (currentPrompt.activeCondition(player)) {
                    this.playerHasBeenPrompted.set(player.id, true);
                }
            }
        }

        this.currentlyResolving.openPrompt = currentPrompt;
    }

    public resetPromptedPlayersTracking(): void {
        this.playerHasBeenPrompted.clear();
    }

    public hasBeenPrompted(player: Player): boolean {
        return !!this.playerHasBeenPrompted.get(player.id);
    }

    /**
     * Prompts a player with a multiple choice menu
     */
    public promptWithMenu(player: Player, contextObj: any, properties: any): void {
        Contract.assertNotNullLike(player);

        this.queueStep(new MenuPrompt(this, player, contextObj, properties));
    }

    /**
     * Prompts a player with a handler-based menu
     */
    public promptWithHandlerMenu(player: Player, properties: any): void {
        Contract.assertNotNullLike(player);

        if (properties.multiSelect) {
            this.queueStep(new HandlerMenuMultipleSelectionPrompt(this, player, properties));
        } else {
            this.queueStep(new HandlerMenuPrompt(this, player, properties));
        }
    }

    public promptDisplayCardsWithButtons(player: Player, properties: IDisplayCardsWithButtonsPromptProperties): void {
        Contract.assertNotNullLike(player);

        this.queueStep(new DisplayCardsWithButtonsPrompt(this, player, properties));
    }

    public promptDisplayCardsForSelection(player: Player, properties: IDisplayCardsSelectProperties): void {
        Contract.assertNotNullLike(player);

        this.queueStep(new DisplayCardsForSelectionPrompt(this, player, properties));
    }

    public promptDisplayCardsBasic(player: Player, properties: IDisplayCardsBasicPromptProperties): void {
        Contract.assertNotNullLike(player);

        this.queueStep(new DisplayCardsBasicPrompt(this, player, properties));
    }

    /**
     * Prompts a player with a menu for selecting a string from a list of options
     */
    public promptWithDropdownListMenu(player: Player, properties: IDropdownListPromptProperties): void {
        Contract.assertNotNullLike(player);

        this.queueStep(new DropdownListPrompt(this, player, properties));
    }

    /**
     * Prompts a player to click a card
     */
    public promptForSelect(player: Player, properties: ISelectCardPromptProperties): void {
        Contract.assertNotNullLike(player);

        this.queueStep(new SelectCardPrompt(this, player, properties));
    }

    /**
     * Prompt for distributing healing or damage among target cards.
     * Response data must be returned via {@link Game.statefulPromptResults}.
     */
    public promptDistributeAmongTargets(player: Player, properties: IDistributeAmongTargetsPromptProperties): void {
        Contract.assertNotNullLike(player);

        this.queueStep(new DistributeAmongTargetsPrompt(this, player, properties));
    }

    /**
     * This function is called by the client whenever a player clicks a button in a prompt
     */
    public menuButton(playerId: string, arg: string, uuid: string, method: string): boolean {
        const player = this.getPlayerById(playerId);

        // check to see if the current step in the pipeline is waiting for input
        return this.pipeline.handleMenuCommand(player, arg, uuid, method);
    }

    /**
     * This function is called by the client whenever a player clicks a "per card" button
     * in a prompt (e.g. Inferno Four prompt). See {@link DisplayCardsWithButtonsPrompt}.
     */
    public perCardMenuButton(playerId: string, arg: string, cardUuid: string, uuid: string, method: string): boolean {
        const player = this.getPlayerById(playerId);

        // check to see if the current step in the pipeline is waiting for input
        return this.pipeline.handlePerCardMenuCommand(player, arg, cardUuid, uuid, method);
    }

    /**
     * Gets the results of a "stateful" prompt from the frontend. This is for more
     * involved prompts such as distributing damage / healing that require the frontend
     * to gather some state and send back, instead of just individual clicks.
     */
    public statefulPromptResults(playerId: string, result: IStatefulPromptResults, uuid: string): boolean {
        const player = this.getPlayerById(playerId);

        // check to see if the current step in the pipeline is waiting for input
        return this.pipeline.handleStatefulPromptResults(player, result, uuid);
    }

    /**
     * This function is called by the client when a player clicks an action window
     * toggle in the settings menu
     */
    public togglePromptedActionWindow(playerId: string, windowName: string, toggle: boolean): void {
        const player = this.getPlayerById(playerId);
        if (!player) {
            return;
        }

        player.promptedActionWindows[windowName] = toggle;
    }

    /**
     * This function is called by the client when a player clicks an option setting
     * toggle in the settings menu
     */
    public toggleOptionSetting(playerId: string, settingName: string, toggle: boolean): void {
        const player = this.getPlayerById(playerId);
        if (!player) {
            return;
        }

        player.optionSettings[settingName] = toggle;
    }

    public toggleManualMode(_playerName: string): void {
        // this.chatCommands.manual(playerName);
    }

    /**
     * Sets up Player objects, creates allCards, starts the game pipeline
     */
    public async initialiseAsync(): Promise<void> {
        await Promise.all(this.getPlayers().map((player) => player.initialiseAsync()));

        this.state.allCards = this.getPlayers().reduce<GameObjectRef<Card>[]>(
            (cards, player) => {
                return cards.concat(player.decklist.allCards);
            },
            []
        );

        this.resolveGameState(true);
        this.initializePipelineForSetup();

        this.playStarted = true;
        this.startedAt = new Date();

        this.continue();
    }

    /**
     * Initializes the pipeline for the game setup.
     * Accepts a parameter indicating whether this operation is due to a rollback, and if so, to what point in the setup.
     */
    public initializePipelineForSetup(rollbackEntryPoint: RollbackSetupEntryPoint | null = null): void {
        let setupPhaseInitializeMode: PhaseInitializeMode;

        switch (rollbackEntryPoint) {
            case RollbackSetupEntryPoint.StartOfSetupPhase:
                setupPhaseInitializeMode = PhaseInitializeMode.RollbackToStartOfPhase;
                break;
            case RollbackSetupEntryPoint.WithinSetupPhase:
                setupPhaseInitializeMode = PhaseInitializeMode.RollbackToWithinPhase;
                break;
            case null:
                setupPhaseInitializeMode = PhaseInitializeMode.Normal;
                break;
            default:
                Contract.fail(`Unknown rollback entry point: ${rollbackEntryPoint}`);
        }

        const setupPhaseStep = [
            new SetupPhase(this, this.snapshotManager, setupPhaseInitializeMode)
        ];

        this.pipeline.initialise([
            ...setupPhaseStep,
            new SimpleStep(this, () => this.beginRound(), 'beginRound')
        ]);
    }

    /**
     * Adds each of the game's main phases to the pipeline
     */
    public beginRound(): void {
        this.roundNumber++;
        this.actionPhaseActivePlayer = this.initiativePlayer;
        this.initializePipelineForRound();
    }

    /**
     * Initializes the pipeline for a new game round.
     * Accepts a parameter indicating whether this operation is due to a rollback, and if so, to what point in the round.
     */
    public initializePipelineForRound(rollbackEntryPoint: RollbackRoundEntryPoint | null = null): void {
        const isRollback = rollbackEntryPoint != null;

        const roundStartStep: IStep[] = [];
        if (!isRollback || rollbackEntryPoint === RollbackRoundEntryPoint.StartOfActionPhase) {
            roundStartStep.push(new SimpleStep(
                this, () => this.createEventAndOpenWindow(EventName.OnBeginRound, null, {}, TriggerHandlingMode.ResolvesTriggers), 'beginRound'
            ));
        }

        const actionPhaseSteps = this.buildActionPhaseSteps(rollbackEntryPoint);
        const regroupPhaseSteps = this.buildRegroupPhaseSteps(rollbackEntryPoint);

        this.pipeline.initialise([
            ...roundStartStep,
            ...actionPhaseSteps,
            ...regroupPhaseSteps,
            new SimpleStep(this, () => this.roundEnded(), 'roundEnded'),
            new SimpleStep(this, () => this.beginRound(), 'beginRound')
        ]);
    }

    /**
     * Initializes the action phase step in the pipeline.
     */
    private buildActionPhaseSteps(rollbackEntryPoint: RollbackRoundEntryPoint | null = null): IStep[] {
        if (
            rollbackEntryPoint === RollbackRoundEntryPoint.StartOfRegroupPhase ||
            rollbackEntryPoint === RollbackRoundEntryPoint.WithinRegroupPhase ||
            rollbackEntryPoint === RollbackRoundEntryPoint.EndOfRegroupPhase
        ) {
            return [];
        }

        let actionInitializeMode: PhaseInitializeMode;
        switch (rollbackEntryPoint) {
            case RollbackRoundEntryPoint.StartOfActionPhase:
                actionInitializeMode = PhaseInitializeMode.RollbackToStartOfPhase;
                break;
            case RollbackRoundEntryPoint.WithinActionPhase:
                actionInitializeMode = PhaseInitializeMode.RollbackToWithinPhase;
                break;
            case RollbackRoundEntryPoint.EndOfActionPhase:
                actionInitializeMode = PhaseInitializeMode.RollbackToEndOfPhase;
                break;
            case null:
                actionInitializeMode = PhaseInitializeMode.Normal;
                break;
            default:
                Contract.fail(`Unknown or invalid rollback entry point for action phase: ${rollbackEntryPoint}`);
        }

        return [
            new ActionPhase(this, () => this.getNextActionNumber(), this._snapshotManager, actionInitializeMode)
        ];
    }

    /**
     * Initializes the regroup phase step in the pipeline.
     */
    private buildRegroupPhaseSteps(rollbackEntryPoint: RollbackRoundEntryPoint | null = null): IStep[] {
        let regroupInitializeMode: PhaseInitializeMode;
        switch (rollbackEntryPoint) {
            case RollbackRoundEntryPoint.StartOfRegroupPhase:
                regroupInitializeMode = PhaseInitializeMode.RollbackToStartOfPhase;
                break;
            case RollbackRoundEntryPoint.WithinRegroupPhase:
                regroupInitializeMode = PhaseInitializeMode.RollbackToWithinPhase;
                break;
            case RollbackRoundEntryPoint.EndOfRegroupPhase:
                regroupInitializeMode = PhaseInitializeMode.RollbackToEndOfPhase;
                break;
            case RollbackRoundEntryPoint.StartOfActionPhase:
            case RollbackRoundEntryPoint.WithinActionPhase:
            case RollbackRoundEntryPoint.EndOfActionPhase:
            case null:
                regroupInitializeMode = PhaseInitializeMode.Normal;
                break;
            default:
                Contract.fail(`Unknown rollback entry point for regroup phase: ${rollbackEntryPoint}`);
        }

        const additionalRegroupPhaseEffects: AdditionalPhaseEffect[] = this.getPlayers()
            .flatMap((p) => p.getOngoingEffectValues(EffectName.AdditionalPhase))
            .filter((value) => value.phase === PhaseName.Regroup);

        // If any additional regroup phases have started, we shouldn't create the main regroup phase again
        if (additionalRegroupPhaseEffects.some((effect) => effect.hasStartedPhaseThisRound(this.roundNumber))) {
            return [
                new SimpleStep(this, () => this.checkCreateAdditionalRegroupPhases(regroupInitializeMode), 'checkCreateAdditionalRegroupPhases')
            ];
        }

        return [
            new RegroupPhase(this, this._snapshotManager, regroupInitializeMode),
            // All phases except for the first should use Normal initialize mode
            new SimpleStep(this, () => this.checkCreateAdditionalRegroupPhases(PhaseInitializeMode.Normal), 'checkCreateAdditionalRegroupPhases')
        ];
    }

    /**
     * Creates additional regroup phases as needed based on ongoing effects.
     */
    private checkCreateAdditionalRegroupPhases(regroupInitializeMode: PhaseInitializeMode): void {
        const additionalRegroupPhaseEffects: AdditionalPhaseEffect[] = this.getPlayers()
            .flatMap((p) => p.getOngoingEffectValues(EffectName.AdditionalPhase))
            .filter((value) =>
                value.phase === PhaseName.Regroup &&
                // Skip if this effect has completed an additional phase this round
                // This can happen if we're rebuilding the pipeline after a rollback
                !value.hasEndedPhaseThisRound(this.roundNumber)
            );

        let usedInitializeMode = false;

        // Create additional regroup phase steps per ongoing effect
        for (const effect of additionalRegroupPhaseEffects) {
            const regroupPhase = new RegroupPhase(
                this,
                this._snapshotManager,
                usedInitializeMode  // All initialize modes after the first should be Normal
                    ? PhaseInitializeMode.Normal
                    : regroupInitializeMode,
                effect
            );

            this.pipeline.queueStep(regroupPhase);
            usedInitializeMode = true;
        }
    }

    private roundEnded(): void {
        this.createEventAndOpenWindow(EventName.OnRoundEnded, null, {}, TriggerHandlingMode.ResolvesTriggers);

        // at end of round, any tokens (except the Force tokens) in outsideTheGameZone are removed completely
        for (const player of this.getPlayers()) {
            for (const token of player.outsideTheGameZone.cards.filter((card) => card.isToken() && !card.isForceToken())) {
                this.removeTokenFromPlay(token as ITokenCard);
            }
        }
    }

    private getNextActionNumber(): number {
        this.actionNumber++;
        return this.actionNumber;
    }

    public claimInitiative(player: Player): void {
        this.initiativePlayer = player;
        this.isInitiativeClaimed = true;
        player.passedActionPhase = true;
        this.createEventAndOpenWindow(EventName.OnClaimInitiative, null, { player }, TriggerHandlingMode.ResolvesTriggers);

        // update game state for the sake of constant abilities that check initiative
        this.resolveGameState();
    }

    /**
     * Adds a step to the pipeline queue
     */
    public queueStep<TStep extends IStep>(step: TStep): TStep {
        this.pipeline.queueStep(step);
        return step;
    }

    /**
     * Creates a step which calls a handler function
     */
    public queueSimpleStep(handler: () => void, stepName: string): void {
        this.pipeline.queueStep(new SimpleStep(this, handler, stepName));
    }

    /**
     * Resolves a card ability
     */
    public resolveAbility(context: AbilityContext, ignoredRequirements: string[] = []): AbilityResolver {
        const resolver = new AbilityResolver(this, context, false, null, null, ignoredRequirements);
        this.queueStep(resolver);
        return resolver;
    }

    /**
     * Creates a game GameEvent, and opens a window for it.
     */
    public createEventAndOpenWindow(
        eventName: EventName,
        context: AbilityContext | null = null,
        params: Record<string, any> = {},
        triggerHandlingMode: TriggerHandlingMode = TriggerHandlingMode.PassesTriggersToParentWindow,
        handler: (event: GameEvent) => void = () => undefined
    ): GameEvent {
        const event = new GameEvent(eventName, context ?? this.getFrameworkContext(), params, handler);
        this.openEventWindow([event], triggerHandlingMode);
        return event;
    }

    /**
     * Directly emits an event to all listeners (does NOT open an event window)
     */
    public emitEvent(eventName: EventName, context: AbilityContext | null = null, params: Record<string, any> = {}): void {
        const event = new GameEvent(eventName, context ?? this.getFrameworkContext(), params);
        this.emit(event.name, event);
    }

    /**
     * Creates an EventWindow which will open windows for each kind of triggered
     * ability which can respond any passed events, and execute their handlers.
     */
    public openEventWindow(events: GameEvent | GameEvent[], triggerHandlingMode: TriggerHandlingMode = TriggerHandlingMode.PassesTriggersToParentWindow): EventWindow {
        if (!Array.isArray(events)) {
            events = [events];
        }
        return this.queueStep(new EventWindow(this, events, triggerHandlingMode));
    }

    /**
     * Creates a "sub-window" for events which will have priority resolution and
     * be resolved immediately after the currently resolving set of events, preceding
     * the next steps of any ability being resolved.
     *
     * Typically used for defeat events.
     */
    public addSubwindowEvents(events: GameEvent | GameEvent[]): void {
        this.currentEventWindow.addSubwindowEvents(events);
    }

    public getFrameworkContext(player: Player | null = null): AbilityContext {
        return new AbilityContext({ game: this, player: player });
    }

    public watch(socketId: string, user: IUser): boolean {
        if (!this.allowSpectators) {
            return false;
        }

        this.playersAndSpectators[user.username] = new Spectator(socketId, user);
        this.addMessage('{0} has joined the game as a spectator', user.username);

        return true;
    }

    public join(socketId: string, user: IUser): boolean {
        if (this.started || this.getPlayers().length === 2) {
            return false;
        }

        this.playersAndSpectators[user.username] = createGameObject(Player, socketId, user, this);

        return true;
    }

    public leave(playerName: string): void {
        const player = this.playersAndSpectators[playerName];

        if (!player) {
            return;
        }

        this.addMessage('{0} has left the game', playerName);

        if (this.isSpectator(player) || !this.started) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.playersAndSpectators[playerName];
        } else {
            player.left = true;

            if (!this.finishedAt) {
                this.finishedAt = new Date();
            }
        }
    }

    public disconnect(playerName: string): void {
        const player = this.playersAndSpectators[playerName];

        if (!player) {
            return;
        }

        this.addMessage('{0} has disconnected', player);

        if (this.isSpectator(player)) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.playersAndSpectators[playerName];
        } else {
            player.disconnected = true;
            player.socket = undefined;
        }
    }

    public failedConnect(playerName: string): void {
        const player = this.playersAndSpectators[playerName];

        if (!player) {
            return;
        }

        if (this.isSpectator(player) || !this.started) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.playersAndSpectators[playerName];
        } else {
            this.addMessage('{0} has failed to connect to the game', player);

            player.disconnected = true;

            if (!this.finishedAt) {
                this.finishedAt = new Date();
            }
        }
    }

    public reconnect(socket: any, playerName: string): void {
        const player = this.getPlayerByName(playerName);
        if (!player) {
            return;
        }

        player.id = socket.id;
        player.socket = socket;
        player.disconnected = false;

        this.addMessage('{0} has reconnected', player);
    }

    public removeCostAdjusterFromAll(costAdjuster: CostAdjuster): void {
        for (const player of this.getPlayers()) {
            player.removeCostAdjuster(costAdjuster);
        }
    }

    /** Goes through the list of cards moved during event resolution and does a uniqueness rule check for each */
    public checkUniqueRule(): void {
        const checkedCards: Card[] = [];

        for (const movedCard of this.state.movedCards.map((ref) => this.getFromRef(ref))) {
            if (EnumHelpers.isArena(movedCard.zoneName) && movedCard.unique) {
                const existingCard = checkedCards.find((otherCard) =>
                    otherCard.title === movedCard.title &&
                    otherCard.subtitle === movedCard.subtitle &&
                    otherCard.controller === movedCard.controller
                );

                if (!existingCard && movedCard.canBeInPlay()) {
                    checkedCards.push(movedCard);
                    movedCard.checkUnique();
                }
            }
        }
    }

    public resolveGameState(hasChanged = false, events: GameEvent[] = []): void {
        // first go through and enable / disabled abilities for cards that have been moved in or out of the arena
        for (const movedCard of this.state.movedCards.map((ref) => this.getFromRef(ref))) {
            movedCard.resolveAbilitiesForNewZone();
        }
        this.state.movedCards = [];

        if (events.length > 0) {
            // check for any delayed effects which need to fire
            this.ongoingEffectEngine.checkDelayedEffects(events);
        }

        // check for a game state change (recalculating attack stats if necessary)
        if (
            this.ongoingEffectEngine.resolveEffects(hasChanged) || hasChanged
        ) {
            this.checkWinCondition();
            // if the state has changed, check for:

            // - any defeated units
            for (const card of this.getArenaUnits()) {
                card.checkDefeatedByOngoingEffect();
            }
        }
    }

    public continue(): void {
        this.pipeline.continue(this);
    }

    /**
     * Receives data for the token cards and builds a factory method for each type
     */
    private initialiseTokens(tokenCardsData: ITokenCardsData): void {
        this.checkTokenDataProvided(TokenUpgradeName, tokenCardsData);
        this.checkTokenDataProvided(TokenUnitName, tokenCardsData);
        this.checkTokenDataProvided(TokenCardName, tokenCardsData);

        this.tokenFactories = {};

        for (const [tokenName, cardData] of Object.entries(tokenCardsData)) {
            const tokenConstructor = cards.get(cardData.id);

            Contract.assertNotNullLike(tokenConstructor, `Token card data for ${tokenName} contained unknown id '${cardData.id}'`);

            this.tokenFactories[tokenName] = (player, additionalProperties) => createGameObject(tokenConstructor, player, cardData, additionalProperties);
        }
    }

    private checkTokenDataProvided(tokenTypeNames: Record<string, string>, tokenCardsData: ITokenCardsData): void {
        for (const tokenName of Object.values(tokenTypeNames)) {
            if (!(tokenName in tokenCardsData)) {
                throw new Error(`Token type '${tokenName}' was not included in token data for game initialization`);
            }
        }
    }

    /**
     * Creates a new token in an out of play zone owned by the player and
     * adds it to all relevant card lists
     */
    public generateToken(player: Player, tokenName: TokenName, additionalProperties: any = null): Card {
        const token: ITokenCard = this.tokenFactories[tokenName](player, additionalProperties);

        // TODO: Rework allCards to be GO Refs
        this.state.allCards.push(token.getRef());
        player.decklist.tokens.push(token.getRef());
        player.decklist.allCards.push(token.getRef());
        player.outsideTheGameZone.addCard(token);
        token.initializeZone(player.outsideTheGameZone);

        return token;
    }

    /**
     * Removes a token from all relevant card lists, including its zone
     */
    public removeTokenFromPlay(token: ITokenCard): void {
        Contract.assertEqual(token.zoneName, ZoneName.OutsideTheGame,
            `Tokens must be moved to zone ${ZoneName.OutsideTheGame} before removing from play, instead found token at ${token.zoneName}`
        );

        token.removeFromGame();
    }

    /**
     * Registers that a card has been moved to a different zone and therefore requires updating in the
     * next call to resolveGameState
     */
    public registerMovedCard(card: Card): void {
        this.state.movedCards.push(card.getRef());
    }

    public filterCardFromList(removeCard: Card, list: GameObjectRef[]): void {
        const indexes: number[] = [];

        for (let i = list.length - 1; i >= 0; i--) {
            const ref = list[i];
            if (ref.uuid === removeCard.uuid) {
                indexes.push(i);
            }
        }

        for (const index of indexes) {
            list.splice(index, 1);
        }
    }

    public getFromRef<T extends GameObjectBase>(gameRef: GameObjectRef<T>): T | null {
        return this.gameObjectManager.get(gameRef);
    }

    /**
     * @deprecated Avoid using this outside of advanced scenarios. This cannot enforce type safety unlike `get` and may result in runtime errors if used incorrectly.
     */
    public getFromUuidUnsafe<T extends GameObjectBase>(uuid: string): T | null {
        return this.gameObjectManager.getUnsafe(uuid);
    }

    public getNextGameEventId(): number {
        this.state.lastGameEventId += 1;
        return this.state.lastGameEventId;
    }

    /**
     * Returns the serialized game state for a specific player/spectator.
     * Tracks message offsets internally per player/spectator for incremental message sync.
     */
    public getState(notInactivePlayerId: string) {
        const lastMessageOffset = this.chatMessageOffsets.get(notInactivePlayerId) ?? 0;
        try {
            const activePlayer = this.playersAndSpectators[notInactivePlayerId] || new AnonymousSpectator();

            if (this._serializationFailure) {
                return {
                    newMessages: [`A severe server error has occurred and made this game unplayable. This incident has been reported to the dev team. Please feel free to reach out in the Karabast discord to provide additional details so we can resolve this faster (game id ${this.id}).`],
                    messageOffset: lastMessageOffset,
                    totalMessages: lastMessageOffset + 1,
                    playerUpdate: activePlayer.name,
                    id: this.id,
                    owner: this.owner,
                    players: {},
                    phase: this.currentPhase,
                    initiativeClaimed: this.isInitiativeClaimed,
                    clientUIProperties: {},
                    spectators: {},
                    winners: [],
                };
            }

            const playerState: Record<string, any> = {};
            if (this.started) {
                for (const player of this.getPlayers()) {
                    playerState[player.id] = player.getStateSummary(activePlayer);
                }

                const allMessages = this.gameChat.messages;
                const totalMessages = allMessages.length;
                const newMessages = allMessages.slice(lastMessageOffset);

                const gameState = {
                    playerUpdate: activePlayer.name,
                    id: this.id,
                    manualMode: this.manualMode,
                    owner: this.owner,
                    players: playerState,
                    phase: this.currentPhase,
                    newMessages: newMessages,
                    messageOffset: lastMessageOffset,
                    totalMessages: totalMessages,
                    initiativeClaimed: this.isInitiativeClaimed,
                    clientUIProperties: this.clientUIProperties,
                    spectators: this.getSpectators().map((spectator) => {
                        return {
                            id: spectator.id,
                            name: spectator.name
                        };
                    }),
                    started: this.started,
                    gameMode: this.gameMode,
                    winners: this.winnerNames,
                    undoEnabled: this.isUndoEnabled,
                };

                // Advance the offset for this participant
                this.chatMessageOffsets.set(notInactivePlayerId, totalMessages);

                // Convert nulls to undefined so JSON.stringify strips them (reduces payload size)
                Helpers.convertNullToUndefinedRecursiveInPlace(gameState);
                return gameState;
            }
            return {};
        } catch (e) {
            this.reportSerializationFailure(e);
        }
    }

    public setUndoConfirmationRequired(enabled: boolean): void {
        if (
            enabled && this.snapshotManager.undoMode === UndoMode.Request ||
            !enabled && this.snapshotManager.undoMode !== UndoMode.Request
        ) {
            return;
        }

        this.snapshotManager.setUndoConfirmationRequired(enabled);
        this.freeUndoLimit = enabled
            ? new PerGameUndoLimit(1)
            : new UnlimitedUndoLimit();
    }

    public countAvailableActionSnapshots(playerId: string): number {
        Contract.assertNotNullLike(playerId);
        return this.snapshotManager.countAvailableActionSnapshots(playerId);
    }

    public countAvailableManualSnapshots(playerId: string): number {
        Contract.assertNotNullLike(playerId);
        return this.snapshotManager.countAvailableManualSnapshots(playerId);
    }

    public countAvailablePhaseSnapshots(phaseName: PhaseName.Action | PhaseName.Regroup): number {
        Contract.assertNotNullLike(phaseName);
        return this.snapshotManager.countAvailablePhaseSnapshots(phaseName);
    }

    public hasAvailableQuickSnapshot(playerId: string): QuickUndoAvailableState {
        Contract.assertNotNullLike(playerId);

        if (this.undoConfirmationOpen) {
            return QuickUndoAvailableState.WaitingForConfirmation;
        }

        const player = this.getPlayerById(playerId);

        if (!this.snapshotManager.hasAvailableQuickSnapshot(playerId)) {
            return QuickUndoAvailableState.NoSnapshotAvailable;
        }

        const rollbackInformation = this.snapshotManager.getRollbackInformation({ type: SnapshotType.Quick, playerId });
        if (this.confirmationRequiredForRollback(playerId, rollbackInformation)) {
            return player.undoRequestsBlocked ? QuickUndoAvailableState.UndoRequestsBlocked : QuickUndoAvailableState.RequestUndoAvailable;
        }

        return QuickUndoAvailableState.FreeUndoAvailable;
    }

    /**
     * Takes a manual snapshot of the current game state for the given player
     */
    public takeManualSnapshot(player: Player): number {
        if (this.isUndoEnabled) {
            Contract.assertHasProperty(player, 'id', 'Player must have an id to take a manual snapshot');
            return this._snapshotManager.takeSnapshot({ type: SnapshotType.Manual, playerId: player.id });
        }

        return -1;
    }

    /**
     * Attempts to restore the designated snapshot
     *
     * @return True if the rollback was successful or we prompted the opponent to confirm, false otherwise
     */
    public rollbackToSnapshot(playerId: string, settings: IGetSnapshotSettings): boolean {
        if (!this.isUndoEnabled) {
            return false;
        }

        const player = this.getPlayerById(playerId);

        const rollbackInformation = this.snapshotManager.getRollbackInformation(settings);

        let message: string;
        switch (settings.type) {
            case SnapshotType.Manual:
                message = 'a previous bookmark';
                break;
            case SnapshotType.Phase:
                message = `the start of the ${settings.phaseName} phase (round ${this.roundNumber})`;
                break;
            case SnapshotType.Quick:
                message = `their ${rollbackInformation.isSameTimepoint ? 'current' : 'previous'} action`;
                break;
            case SnapshotType.Action:
                message = 'their previous action';
                break;
            default:
                // @ts-expect-error this is here in case we add a new value for SnapshotType
                Contract.fail(`Unknown snapshot type: ${settings.type}`);
        }

        const rollbackHandler = this._snapshotManager.buildRollbackHandler(settings);

        const performRollback = () => {
            const result = this.rollbackToSnapshotInternal(settings, rollbackHandler);

            if (!result) {
                return false;
            }

            this.addAlert(AlertType.Notification, '{0} has rolled back to {1}', player, message);
            return true;
        };

        if (this.confirmationRequiredForRollback(playerId, rollbackInformation)) {
            if (player.undoRequestsBlocked) {
                return false;
            }

            let undoTypePromptMessage = message;
            if (settings.type !== SnapshotType.Quick && settings.type !== SnapshotType.Action) {
                undoTypePromptMessage = `to ${message}`;
            }
            this.addAlert(AlertType.Notification, '{0} has requested to undo', player);
            this.queueStep(new UndoConfirmationPrompt(this, player.opponent, undoTypePromptMessage, performRollback));

            return true;
        }

        const result = performRollback();

        if (result) {
            this.freeUndoLimit.incrementUses(playerId);
        }

        return result;
    }

    private confirmationRequiredForRollback(playerId: string, rollbackInformation: ICanRollBackResult): boolean {
        if (this.snapshotManager.undoMode !== UndoMode.Request) {
            return false;
        }

        if (rollbackInformation.requiresConfirmation || this.freeUndoLimit.hasReachedLimit(playerId)) {
            return true;
        }

        // check if opponent has revealed information on their turn
        const player = this.getPlayerById(playerId);
        const opponent = player.opponent;

        // if it's the undoing player's action, no risk of revealed information
        if (this.currentPhase === PhaseName.Action && this.actionPhaseActivePlayer === player) {
            return false;
        }

        return !!opponent.hasResolvedAbilityThisTimepoint;
    }

    private rollbackToSnapshotInternal(settings: IGetSnapshotSettings, rollbackHandler: (() => any) | null = null): boolean {
        if (!this.isUndoEnabled) {
            return false;
        }

        const start = process.hrtime.bigint();

        let rollbackResult: any;
        try {
            this.preUndoStateForError = { gameState: this.captureGameState('any'), settings };

            rollbackResult = rollbackHandler ? rollbackHandler() : this._snapshotManager.rollbackTo(settings);

            if (!rollbackResult.success) {
                return false;
            }

            this._actionsSinceLastUndo = 0;

            this.postRollbackOperations(rollbackResult.entryPoint);

            if (rollbackResult.rolledPastGameEnd) {
                this._router.handleUndoGameEnd();
            }

            const postUndoState = this.captureGameState('any');

            const end = process.hrtime.bigint();
            const durationMs = Number(end - start) / 1_000_000;
            const gameStates = {
                preUndoState: this.preUndoStateForError,
                postUndoState,
            };
            if (process.env.NODE_ENV !== 'test') {
                logger.info('Rollback operation completed', {
                    lobbyId: this.lobbyId,
                    gameId: this.id,
                    rollbackSettings: settings,
                    durationMs,
                    gameStates
                });
            }

            return rollbackResult.success;
        } catch (error) {
            if (process.env.NODE_ENV !== 'test') {
                this.reportSevereRollbackFailure(error as Error);
            }

            throw error;
        } finally {
            this.preUndoStateForError = null;
        }
    }

    public reportSevereRollbackFailure(error: Error): void {
        if (process.env.NODE_ENV === 'test') {
            throw error;
        }

        logger.error('Rollback failed', {
            lobbyId: this.lobbyId,
            gameId: this.id,
            rollbackSettings: this.preUndoStateForError?.settings,
            preUndoState: this.preUndoStateForError?.gameState,
            error: { message: error.message, stack: error.stack }
        });
        this.reportError(error, GameErrorSeverity.SevereHaltGame);
    }

    public postRollbackOperations(entryPoint: IRollbackSetupEntryPoint | IRollbackRoundEntryPoint): void {
        this.pipeline.clearSteps();
        this.initializeCurrentlyResolving();
        if (entryPoint.type === RollbackEntryPointType.Setup) {
            this.initializePipelineForSetup(entryPoint.entryPoint);
        } else if (entryPoint.type === RollbackEntryPointType.Round) {
            this.initializePipelineForRound(entryPoint.entryPoint);
        }
        this.pipeline.continue(this);
    }

    // TODO: Make a debug object type.
    /**
     * Should only be used for manual testing inside of unit tests, *never* committing any usage into main.
     */
    public debug(settings: { pipeline: boolean }, fcn: () => void): void {
        const currDebug = this._debug;
        if (Helpers.isDevelopment()) {
            this._debug = settings;
        }
        try {
            fcn();
        } finally {
            this._debug = currDebug;
        }
    }

    /**
     * Should only be used for manual testing inside of unit tests, *never* committing any usage into main.
     */
    public debugPipeline(fcn: () => void): void {
        this._debug.pipeline = Helpers.isDevelopment();
        try {
            fcn();
        } finally {
            this._debug.pipeline = false;
        }
    }

    /**
     * Captures the current game state for a bug report
     */
    public captureGameState(reportingPlayer: string): ISerializedGameState {
        if (!this) {
            return {
                error: 'game not found'
            };
        }
        const players = this.getPlayers();
        if (players.length !== 2) {
            return {
                error: `invalid number of players: ${players.length}`
            };
        }
        let player1: Player;
        let player2: Player;

        switch (reportingPlayer) {
            case players[0].id:
                player1 = players[0];
                player2 = players[1];
                break;
            case players[1].id:
                player1 = players[1];
                player2 = players[0];
                break;
            case 'any':
                player1 = players[0];
                player2 = players[1];
                break;
            default:
                Contract.fail(`Reporting player ${reportingPlayer} is not a player in this game`);
        }

        return {
            phase: this.currentPhase,
            attackRulesVersion: this.attackRulesVersion,
            player1: Helpers.safeSerialize(this, () => player1.capturePlayerState('player1'), null),
            player2: Helpers.safeSerialize(this, () => player2.capturePlayerState('player2'), null),
        };
    }
}
