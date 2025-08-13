const EventEmitter = require('events');
const seedrandom = require('seedrandom');

const { GameChat } = require('./chat/GameChat.js');
const { OngoingEffectEngine } = require('./ongoingEffect/OngoingEffectEngine.js');
const { Player } = require('./Player.js');
const { Spectator } = require('../../Spectator.js');
const { AnonymousSpectator } = require('../../AnonymousSpectator.js');
const { GamePipeline } = require('./GamePipeline.js');
const { SetupPhase } = require('./gameSteps/phases/SetupPhase.js');
const { ActionPhase } = require('./gameSteps/phases/ActionPhase.js');
const { RegroupPhase } = require('./gameSteps/phases/RegroupPhase.js');
const { SimpleStep } = require('./gameSteps/SimpleStep.js');
const MenuPrompt = require('./gameSteps/prompts/MenuPrompt.js');
const HandlerMenuPrompt = require('./gameSteps/prompts/HandlerMenuPrompt.js');
const GameOverPrompt = require('./gameSteps/prompts/GameOverPrompt.js');
const GameSystems = require('../gameSystems/GameSystemLibrary.js');
const { GameEvent } = require('./event/GameEvent.js');
const { EventWindow, TriggerHandlingMode } = require('./event/EventWindow');
const { AbilityResolver } = require('./gameSteps/AbilityResolver.js');
const { AbilityContext } = require('./ability/AbilityContext.js');
const Contract = require('./utils/Contract.js');
const { cards } = require('../cards/Index.js');

const { EventName, ZoneName, Trait, WildcardZoneName, TokenUpgradeName, TokenUnitName, PhaseName, TokenCardName, AlertType, SnapshotType, RollbackRoundEntryPoint } = require('./Constants.js');
const { StateWatcherRegistrar } = require('./stateWatcher/StateWatcherRegistrar.js');
const { DistributeAmongTargetsPrompt } = require('./gameSteps/prompts/DistributeAmongTargetsPrompt.js');
const HandlerMenuMultipleSelectionPrompt = require('./gameSteps/prompts/HandlerMenuMultipleSelectionPrompt.js');
const { DropdownListPrompt } = require('./gameSteps/prompts/DropdownListPrompt.js');
const { UnitPropertiesCard } = require('./card/propertyMixins/UnitProperties.js');
const { Card } = require('./card/Card.js');
const { GroundArenaZone } = require('./zone/GroundArenaZone.js');
const { SpaceArenaZone } = require('./zone/SpaceArenaZone.js');
const { AllArenasZone } = require('./zone/AllArenasZone.js');
const EnumHelpers = require('./utils/EnumHelpers.js');
const { SelectCardPrompt } = require('./gameSteps/prompts/SelectCardPrompt.js');
const { DisplayCardsWithButtonsPrompt } = require('./gameSteps/prompts/DisplayCardsWithButtonsPrompt.js');
const { DisplayCardsForSelectionPrompt } = require('./gameSteps/prompts/DisplayCardsForSelectionPrompt.js');
const { DisplayCardsBasicPrompt } = require('./gameSteps/prompts/DisplayCardsBasicPrompt.js');
const { WildcardCardType } = require('./Constants');
const { validateGameConfiguration, validateGameOptions } = require('./GameInterfaces.js');
const { GameStateManager } = require('./snapshot/GameStateManager.js');
const { ActionWindow } = require('./gameSteps/ActionWindow.js');
const { User } = require('../../utils/user/User');
const { GameObjectBase } = require('./GameObjectBase.js');
const Helpers = require('./utils/Helpers.js');
const { CostAdjuster } = require('./cost/CostAdjuster.js');
const { logger } = require('../../logger.js');
const { SnapshotManager } = require('./snapshot/SnapshotManager.js');
const AbilityHelper = require('../AbilityHelper.js');
const { AbilityLimitInstance } = require('./ability/AbilityLimit.js');
const { getAbilityHelper } = require('../AbilityHelper.js');
const { PhaseInitializeMode } = require('./gameSteps/phases/Phase.js');
const { Randomness } = require('../core/Randomness.js');

class Game extends EventEmitter {
    #debug;
    #experimental;

    /** @returns { Player | null } */
    get actionPhaseActivePlayer() {
        return this.gameObjectManager.get(this.state.actionPhaseActivePlayer);
    }

    /**
     * @argument {Player | null} value
     */
    set actionPhaseActivePlayer(value) {
        this.state.actionPhaseActivePlayer = value?.getRef();
    }

    get allCards() {
        return this.state.allCards.map((x) => this.getFromRef(x));
    }

    /** @returns { Player | null } */
    get initialFirstPlayer() {
        return this.gameObjectManager.get(this.state.initialFirstPlayer);
    }

    /**
     * @argument {Player | null} value
     */
    set initialFirstPlayer(value) {
        this.state.initialFirstPlayer = value?.getRef();
    }

    /** @returns { Player | null } */
    get initiativePlayer() {
        return this.gameObjectManager.get(this.state.initiativePlayer);
    }

    /**
     * @argument {Player | null} value
     */
    set initiativePlayer(value) {
        this.state.initiativePlayer = value?.getRef();
    }

    get isInitiativeClaimed() {
        return this.state.isInitiativeClaimed;
    }

    set isInitiativeClaimed(value) {
        this.state.isInitiativeClaimed = value;
    }

    get roundNumber() {
        return this.state.roundNumber;
    }

    set roundNumber(value) {
        Contract.assertNonNegative(value, 'Round number must be non-negative: ' + value);
        this.state.roundNumber = value;
    }

    get isDebugPipeline() {
        return this.#debug.pipeline;
    }

    get isUndoEnabled() {
        return this.snapshotManager.undoEnabled;
    }

    get actionNumber() {
        return this.state.actionNumber;
    }

    set actionNumber(value) {
        Contract.assertNonNegative(value, 'Action number must be non-negative: ' + value);
        this.state.actionNumber = value;
    }

    get gameObjectManager() {
        return this.snapshotManager.gameObjectManager;
    }

    get winnerNames() {
        return this.state.winnerNames;
    }

    get randomGenerator() {
        return this._randomGenerator;
    }

    get currentPhase() {
        return this.state.currentPhase;
    }

    set currentPhase(value) {
        this.state.currentPhase = value;
    }

    get currentAbilityResolver() {
        return this.currentlyResolving.abilityResolver;
    }

    set currentAbilityResolver(value) {
        this.currentlyResolving.abilityResolver = value;
    }

    get currentActionWindow() {
        return this.currentlyResolving.actionWindow;
    }

    set currentActionWindow(value) {
        this.currentlyResolving.actionWindow = value;
    }

    get currentAttack() {
        return this.currentlyResolving.attack;
    }

    set currentAttack(value) {
        this.currentlyResolving.attack = value;
    }

    get currentEventWindow() {
        return this.currentlyResolving.eventWindow;
    }

    set currentEventWindow(value) {
        this.currentlyResolving.eventWindow = value;
    }

    get currentOpenPrompt() {
        return this.currentlyResolving.openPrompt;
    }

    set currentOpenPrompt(value) {
        this.currentlyResolving.openPrompt = value;
    }

    /**
     * @param {import('./GameInterfaces.js').GameConfiguration} details
     * @param {import('./GameInterfaces.js').GameOptions} options
     */
    constructor(details, options) {
        super();

        Contract.assertNotNullLike(details);
        validateGameConfiguration(details);
        Contract.assertNotNullLike(options);
        validateGameOptions(options);

        /** @private */
        this.snapshotManager = new SnapshotManager(this, details.enableUndo);

        this.ongoingEffectEngine = new OngoingEffectEngine(this);

        /** @type {import('../AbilityHelper.js').IAbilityHelper} */
        this.abilityHelper = getAbilityHelper(this);

        /** @type { {[key: string]: Player | Spectator} } */
        this.playersAndSpectators = {};
        this.gameChat = new GameChat(details.pushUpdate);
        this.pipeline = new GamePipeline();
        this.id = details.id;
        this.allowSpectators = details.allowSpectators;
        this.owner = details.owner;
        this.started = false;
        this.statsUpdated = false;
        this.playStarted = false;
        this.createdAt = new Date();

        this.buildSafeTimeoutHandler = details.buildSafeTimeout;
        this.userTimeoutDisconnect = details.userTimeoutDisconnect;

        // Debug flags, intended only for manual testing, and should always be false. Use the debug methods to temporarily flag these on.
        this.#debug = { pipeline: false };
        // Experimental flags, intended only for manual testing. Use the enable methods to temporarily flag these on during tests.
        this.#experimental = { };

        this.manualMode = false;
        this.gameMode = details.gameMode;

        this.initializeCurrentlyResolving();

        /** @private @readonly @type {import('./Randomness.js').IRandomness} */
        this._randomGenerator = new Randomness();

        /** @type { import('./snapshot/SnapshotInterfaces.js').IGameState } */
        this.state = {
            initialFirstPlayer: null,
            initiativePlayer: null,
            actionPhaseActivePlayer: null,
            roundNumber: 0,
            isInitiativeClaimed: false,
            allCards: [],
            actionNumber: 0,
            winnerNames: [],
            currentPhase: null,
        };

        this.tokenFactories = null;
        this.stateWatcherRegistrar = new StateWatcherRegistrar(this);
        this.movedCards = [];
        this.cardDataGetter = details.cardDataGetter;
        this.playableCardTitles = this.cardDataGetter.playableCardTitles;

        this.initialiseTokens(this.cardDataGetter.tokenData);

        /** @type {import('../Interfaces').IClientUIProperties} */
        this.clientUIProperties = {};

        this.registerGlobalRulesListeners();

        // TODO TWIN SUNS
        Contract.assertArraySize(
            details.players, 2, `Game must have exactly 2 players, received ${details.players.length}: ${details.players.map((player) => player.id).join(', ')}`
        );

        details.players.forEach((player) => {
            this.playersAndSpectators[player.id] = new Player(
                player.id,
                player,
                this,
                details.useActionTimer ?? false
            );
        });

        details.spectators?.forEach((spectator) => {
            this.playersAndSpectators[spectator.id] = new Spectator(spectator.id, spectator);
        });

        this.spaceArena = new SpaceArenaZone(this);
        this.groundArena = new GroundArenaZone(this);
        this.allArenas = new AllArenasZone(this, this.groundArena, this.spaceArena);

        this.setMaxListeners(0);

        this.router = options.router;
    }


    /**
     * Reports errors from the game engine back to the router
     * @param {Error} e
     */
    reportError(e, severeGameMessage = false) {
        this.router.handleError(this, e, severeGameMessage);
    }

    /**
     * Adds a message to the in-game chat e.g 'Jadiel draws 1 card'
     * @param {String} message to display (can include {i} references to args)
     * @param {Array} args to match the references in @string
     */
    addMessage() {
        // @ts-expect-error
        this.gameChat.addMessage(...arguments);
    }

    /**
     * Adds a message to in-game chat with a graphical icon
     * @param {AlertType} type
     * @param {String} message to display (can include {i} references to args)
     * @param {Array} args to match the references in @string
     */
    addAlert(type, message, ...args) {
        this.gameChat.addAlert(type, message, ...args);
    }

    /**
     * Build a timeout that will log an error on failure and not crash the server process
     * @param {() => void} callback function to call when timeout hits
     * @param {number} delayMs
     * @param {string} errorMessage message to log on error (error details will be added automatically)
     * @returns {NodeJS.Timeout} reference to timeout object
     */
    buildSafeTimeout(callback, delayMs, errorMessage) {
        return this.buildSafeTimeoutHandler(callback, delayMs, errorMessage);
    }

    initializeCurrentlyResolving() {
        /** @type {import('./GameInterfaces.js').ICurrentlyResolving} */
        this.currentlyResolving = {
            abilityResolver: null,
            actionWindow: null,
            attack: null,
            eventWindow: null,
            openPrompt: null
        };
    }

    get messages() {
        return this.gameChat.messages;
    }

    /**
     * returns last 30 gameChat log messages excluding player chat messages.
     */
    getLogMessages() {
        const filteredMessages = this.gameChat.messages.filter((messageEntry) => {
            const message = messageEntry.message;

            // Check if it's an alert message (these should be included)
            if (typeof message === 'object' && message !== null && 'alert' in message) {
                return true;
            }

            // We need this long check since the first element of message[0] can be String | String[] | object with type | []
            if (Array.isArray(message) && message.length > 0) {
                const firstElement = message[0];
                if (typeof firstElement === 'object' && firstElement && 'type' in firstElement && 'type' in firstElement && firstElement['type'] === 'playerChat') {
                    return false;
                }
            }
            return true;
        });
        return filteredMessages.slice(-30);
    }

    /**
     * Checks if a player is a spectator
     * @param {Player | Spectator} player
     * @returns {player is Spectator}
     */
    isSpectator(player) {
        return player.constructor === Spectator;
    }

    /**
     * Checks if a player is a player
     * @param {Player | Spectator} player
     * @returns {player is Player}
     */
    isPlayer(player) {
        return !this.isSpectator(player);
    }

    /**
     * Checks whether a player/spectator is still in the game
     * @param {String} playerName
     * @returns {Boolean}
     */
    hasPlayerNotInactive(playerName) {
        const player = this.playersAndSpectators[playerName];
        if (!player) {
            return false;
        }

        return !this.isPlayer(player) || !player.left;
    }

    /**
     * Get all players currently captured cards
     * @param {Player} player
     * @returns {Array}
     */
    getAllCapturedCards(player) {
        return this.findAnyCardsInPlay((card) => card.isUnit() && card.owner === player)
            .flatMap((card) => card.capturedUnits);
    }

    /**
     * Get all players (not spectators) in the game
     * @returns {Player[]}
     */
    getPlayers() {
        return Object.values(this.playersAndSpectators).filter((player) => this.isPlayer(player));
    }

    /**
     * Returns the Player object (not spectator) for a name
     * @param {String} playerName
     * @returns {Player}
     */
    getPlayerByName(playerName) {
        const player = this.getPlayers().find((player) => player.name === playerName);
        if (player) {
            return player;
        }

        throw new Error(`Player with name ${playerName} not found`);
    }

    /**
     * @param {string} playerId
     * @returns {Player}
     */
    getPlayerById(playerId) {
        Contract.assertHasProperty(this.playersAndSpectators, playerId);

        let player = this.playersAndSpectators[playerId];
        Contract.assertNotNullLike(player, `Player with id ${playerId} not found`);
        Contract.assertTrue(this.isPlayer(player), `Player ${player.name} is a spectator`);

        return player;
    }

    /**
     * Get all players (not spectators) with the first player at index 0
     * @returns {Player[]} Array of Player objects
     */
    getPlayersInInitiativeOrder() {
        return this.getPlayers().sort((a) => (a.hasInitiative() ? -1 : 1));
    }

    getActivePlayer() {
        return this.currentPhase === PhaseName.Action ? this.actionPhaseActivePlayer : this.initiativePlayer;
    }

    /**
     * Get all players and spectators in the game
     * @returns {{[key: string]: Player | Spectator}} {name1: Player, name2: Player, name3: Spectator}
     */
    getPlayersAndSpectators() {
        return this.playersAndSpectators;
    }

    /**
     * Get all spectators in the game
     * @returns {Spectator[]} {name1: Spectator, name2: Spectator}
     */
    getSpectators() {
        return Object.values(this.playersAndSpectators).filter((player) => this.isSpectator(player));
    }

    /**
     * Gets a player other than the one passed (usually their opponent)
     * @param {Player} player
     * @returns {Player}
     */
    getOtherPlayer(player) {
        var otherPlayer = this.getPlayers().find((p) => {
            return p.name !== player.name;
        });

        return otherPlayer;
    }


    registerGlobalRulesListeners() {
        UnitPropertiesCard.registerRulesListeners(this);
    }

    /**
     * Checks who the next legal active player for the action phase should be and updates @member {activePlayer}. If none available, sets it to null.
     */
    rotateActivePlayer() {
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

    setRandomSeed(seed) {
        this._randomGenerator.reseed(seed);
    }

    /**
     * Returns the card (i.e. character) with matching uuid from either players
     * 'in play' area.
     * @param {String} cardId
     * @returns DrawCard
     */
    findAnyCardInPlayByUuid(cardId) {
        return this.getPlayers().reduce(
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
     * @param {String} cardId
     * @returns BaseCard
     */
    findAnyCardInAnyList(cardId) {
        return this.allCards.find((card) => card.uuid === cardId);
    }

    /**
     * Returns all cards from anywhere in the game matching the passed predicate
     * @param {(value: any) => boolean} predicate - card => Boolean
     * @returns {Array} Array of DrawCard objects
     */
    findAnyCardsInAnyList(predicate) {
        return this.allCards.filter(predicate);
    }

    /**
     * Returns all cards which matching the passed predicated function from either players arenas
     * @param {(card: Card) => boolean} predicate - card => Boolean
     * @returns {Array} Array of DrawCard objects
     */
    findAnyCardsInPlay(predicate = () => true) {
        return this.allArenas.getCards({ condition: predicate });
    }

    /**
     * Returns if a card is in play (units, upgrades, base, leader) that has the passed trait
     * @param {Trait} trait
     * @returns {boolean} true/false if the trait is in pay
     */
    isTraitInPlay(trait) {
        return this.getPlayers().some((player) => player.isTraitInPlay(trait));
    }

    /**
     * @param {import('./zone/AllArenasZone').IAllArenasZoneCardFilterProperties} filter
     */
    getArenaCards(filter = {}) {
        return this.allArenas.getCards(filter);
    }

    /**
     * @param {import('./zone/AllArenasZone').IAllArenasSpecificTypeCardFilterProperties} filter
     */
    getArenaUnits(filter = {}) {
        return this.allArenas.getUnitCards(filter);
    }

    /**
     * @param {import('./zone/AllArenasZone').IAllArenasSpecificTypeCardFilterProperties} filter
     */
    getArenaUpgrades(filter = {}) {
        return this.allArenas.getUpgradeCards(filter);
    }

    /**
     * @param {import('./zone/AllArenasZone').IAllArenasZoneCardFilterProperties} filter
     */
    hasSomeArenaCard(filter) {
        return this.allArenas.hasSomeCard(filter);
    }

    /**
     * @param {import('./zone/AllArenasZone').IAllArenasSpecificTypeCardFilterProperties} filter
     */
    hasSomeArenaUnit(filter) {
        return this.allArenas.hasSomeCard({ ...filter, type: WildcardCardType.Unit });
    }

    // createToken(card, token = undefined) {
    //     if (!token) {
    //         token = new SpiritOfTheRiver(card);
    //     } else {
    //         token = new token(card);
    //     }
    //     this.allCards.push(token);
    //     return token;
    // }

    /**
     * Return the `Zone` object corresponding to the arena type
     * @param {ZoneName.SpaceArena | ZoneName.GroundArena | WildcardZoneName.AnyArena} arenaName
     */
    getArena(arenaName) {
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

    get actions() {
        return GameSystems;
    }

    // recordConflict(conflict) {
    //     this.conflictRecord.push({
    //         attackingPlayer: conflict.attackingPlayer,
    //         declaredType: conflict.declaredType,
    //         passed: conflict.conflictPassed,
    //         uuid: conflict.uuid
    //     });
    //     if (conflict.conflictPassed) {
    //         conflict.attackingPlayer.declaredConflictOpportunities[ConflictTypes.Passed]++;
    //     } else if (conflict.forcedDeclaredType) {
    //         conflict.attackingPlayer.declaredConflictOpportunities[ConflictTypes.Forced]++;
    //     } else {
    //         conflict.attackingPlayer.declaredConflictOpportunities[conflict.declaredType]++;
    //     }
    // }

    // getConflicts(player) {
    //     if (!player) {
    //         return [];
    //     }
    //     return this.conflictRecord.filter((record) => record.attackingPlayer === player);
    // }

    // recordConflictWinner(conflict) {
    //     let record = this.conflictRecord.find((record) => record.uuid === conflict.uuid);
    //     if (record) {
    //         record.completed = true;
    //         record.winner = conflict.winner;
    //         record.typeSwitched = conflict.conflictTypeSwitched;
    //     }
    // }

    restartAllActionTimers() {
        this.getPlayers().forEach((player) => player.actionTimer.restartIfRunning());
    }

    onPlayerAction(playerId) {
        const player = this.getPlayerById(playerId);

        player.incrementActionId();
        player.actionTimer.restartIfRunning();
    }

    /** @param {Player} player */
    onActionTimerExpired(player) {
        player.opponent.actionTimer.stop();

        this.userTimeoutDisconnect(player.id);
        this.addAlert(AlertType.Danger, '{0} has been removed due to inactivity.', player);
        return null;
    }

    // TODO: parameter contract checks for this flow
    /**
     * This function is called from the client whenever a card is clicked
     * @param {String} sourcePlayerId - id of the clicking player
     * @param {String} cardId - uuid of the card clicked
     */
    cardClicked(sourcePlayerId, cardId) {
        var player = this.getPlayerById(sourcePlayerId);

        if (!player) {
            return;
        }

        var card = this.findAnyCardInAnyList(cardId);

        if (!card) {
            return;
        }

        // Check to see if the current step in the pipeline is waiting for input
        this.pipeline.handleCardClicked(player, card);
    }

    // /**
    //  * This function is called by the client when a card menu item is clicked
    //  * @param {String} sourcePlayer - name of clicking player
    //  * @param {String} cardId - uuid of card whose menu was clicked
    //  * @param {Object} menuItem - { command: String, text: String, arg: String, method: String }
    //  */
    // menuItemClick(sourcePlayer, cardId, menuItem) {
    //     var player = this.getPlayerByName(sourcePlayer);
    //     var card = this.findAnyCardInAnyList(cardId);
    //     if (!player || !card) {
    //         return;
    //     }

    //     if (menuItem.command === 'click') {
    //         this.cardClicked(sourcePlayer, cardId);
    //         return;
    //     }

    //     MenuCommands.cardMenuClick(menuItem, this, player, card);
    //     this.resolveGameState(true);
    // }

    // /**
    //  * Sets a Player flag and displays a chat message to show that a popup with a
    //  * player's conflict deck is open
    //  * @param {String} playerName
    //  */
    // showDeck(playerName) {
    //     var player = this.getPlayerByName(playerName);

    //     if (!player) {
    //         return;
    //     }

    //     if (!player.showConflict) {
    //         player.showDeck();

    //         this.addMessage('{0} is looking at their conflict deck', player);
    //     } else {
    //         player.showConflict = false;

    //         this.addMessage('{0} stops looking at their conflict deck', player);
    //     }
    // }

    // /**
    //  * This function is called from the client whenever a card is dragged from
    //  * one place to another
    //  * @param {String} playerName
    //  * @param {String} cardId - uuid of card
    //  * @param {String} source - area where the card was dragged from
    //  * @param {String} target - area where the card was dropped
    //  */
    // drop(playerName, cardId, source, target) {
    //     var player = this.getPlayerByName(playerName);

    //     if (!player) {
    //         return;
    //     }

    //     player.drop(cardId, source, target);
    // }

    // /**
    //  * Check to see if a base(or both bases) has been destroyed
    //  */
    checkWinCondition() {
        const losingPlayers = this.getPlayers().filter((player) => player.base.damage >= player.base.getHp());
        if (losingPlayers.length === 1) {
            this.endGame(losingPlayers[0].opponent, 'base destroyed');
        } else if (losingPlayers.length === 2) { // draw game
            this.endGame(losingPlayers, 'both bases destroyed');
        }
    }

    /**
     * Display message declaring victory for one player, and record stats for
     * the game
     * @param {Player[]|Player} winnerPlayers
     * @param {String} reason
     */
    endGame(winnerPlayers, reason) {
        if (this.state.winnerNames.length > 0) {
            // A winner has already been determined. This means the players have chosen to continue playing after game end. Do not trigger the game end again.
            return;
        }

        for (const player of this.getPlayers()) {
            player.actionTimer.stop();
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
            this.addMessage('{0} has won the game', winnerPlayers);
        }
        this.finishedAt = new Date();
        this.gameEndReason = reason;
        // this.router.gameWon(this, reason, winner);
        // TODO Tests failed since this.router doesn't exist for them we use an if statement to unblock.
        // TODO maybe later on we could have a check here if the environment test?
        if (typeof this.router.sendGameState === 'function') {
            this.router.sendGameState(this); // call the function if it exists
        } else {
            this.queueStep(new GameOverPrompt(this));
        }
    }

    /**
     * Changes a Player variable and displays a message in chat
     * @param {String} playerId
     * @param {String} stat
     * @param {Number} value
     */
    changeStat(playerId, stat, value) {
        var player = this.getPlayerById(playerId);
        if (!player) {
            return;
        }

        var target = player;

        target[stat] += value;

        if (target[stat] < 0) {
            target[stat] = 0;
        } else {
            this.addMessage('{0} sets {1} to {2} ({3})', player, stat, target[stat], (value > 0 ? '+' : '') + value);
        }
    }

    /**
     * This function is called by the client every time a player enters a chat message
     * @param {String} playerId
     * @param {String} message
     */
    chat(playerId, message) {
        var player = this.getPlayerById(playerId);
        var args = message.split(' ');

        if (!player) {
            return;
        }

        // if (!this.isSpectator(player)) {
        //     if (this.chatCommands.executeCommand(player, args[0], args)) {
        //         this.resolveGameState(true);
        //         return;
        //     }

        //     let card = _.find(this.shortCardData, (c) => {
        //         return c.name.toLowerCase() === message.toLowerCase() || c.id.toLowerCase() === message.toLowerCase();
        //     });

        //     if (card) {
        //         this.gameChat.addChatMessage(player, { message: this.gameChat.formatMessage('{0}', [card]) });

        //         return;
        //     }
        // }

        if (!this.isSpectator(player)) {
            this.gameChat.addChatMessage(player, message);
        }
    }

    /**
     * This is called by the client when a player clicks 'Concede'
     * @param {String} playerId
     */
    concede(playerId) {
        var player = this.getPlayerById(playerId);

        if (!player) {
            return;
        }

        this.addMessage('{0} concedes', player);

        var otherPlayer = this.getOtherPlayer(player);

        if (otherPlayer) {
            this.endGame(otherPlayer, 'concede');
        }
    }

    selectDeck(playerId, deck) {
        let player = this.getPlayerById(playerId);
        if (player) {
            player.selectDeck(deck);
        }
    }

    /**
     * Called when a player clicks Shuffle Deck on the conflict deck menu in
     * the client
     * @param {String} playerId
     * @param {AbilityContext} context
     */
    shuffleDeck(playerId, context = null) {
        let player = this.getPlayerById(playerId);
        if (player) {
            player.shuffleDeck(context);
        }
    }

    /**
     * Prompts a player with a multiple choice menu
     * @param {Player} player
     * @param {Object} contextObj - the object which contains the methods that are referenced by the menubuttons
     * @param {Object} properties - see menuprompt.js
     */
    promptWithMenu(player, contextObj, properties) {
        Contract.assertNotNullLike(player);

        this.queueStep(new MenuPrompt(this, player, contextObj, properties));
    }

    /**
     * Prompts a player with a multiple choice menu
     * @param {Player} player
     * @param {Object} properties - see handlermenuprompt.js
     */
    promptWithHandlerMenu(player, properties) {
        Contract.assertNotNullLike(player);

        if (properties.multiSelect) {
            this.queueStep(new HandlerMenuMultipleSelectionPrompt(this, player, properties));
        } else {
            this.queueStep(new HandlerMenuPrompt(this, player, properties));
        }
    }

    /**
     *  @param {Player} player
     *  @param {import('./gameSteps/PromptInterfaces.js').IDisplayCardsWithButtonsPromptProperties} properties
     */
    promptDisplayCardsWithButtons(player, properties) {
        Contract.assertNotNullLike(player);

        this.queueStep(new DisplayCardsWithButtonsPrompt(this, player, properties));
    }

    /**
     *  @param {Player} player
     *  @param {import('./gameSteps/PromptInterfaces.js').IDisplayCardsSelectProperties} properties
     */
    promptDisplayCardsForSelection(player, properties) {
        Contract.assertNotNullLike(player);

        this.queueStep(new DisplayCardsForSelectionPrompt(this, player, properties));
    }

    /**
     *  @param {Player} player
     *  @param {import('./gameSteps/PromptInterfaces.js').IDisplayCardsBasicPromptProperties} properties
     */
    promptDisplayCardsBasic(player, properties) {
        Contract.assertNotNullLike(player);

        this.queueStep(new DisplayCardsBasicPrompt(this, player, properties));
    }

    /**
     * Prompts a player with a menu for selecting a string from a list of options
     * @param {Player} player
     * @param {import('./gameSteps/prompts/DropdownListPrompt.js').IDropdownListPromptProperties} properties
     */
    promptWithDropdownListMenu(player, properties) {
        Contract.assertNotNullLike(player);

        this.queueStep(new DropdownListPrompt(this, player, properties));
    }

    /**
     * Prompts a player to click a card
     * @param {Player} player
     * @param {import('./gameSteps/PromptInterfaces.js').ISelectCardPromptProperties} properties - see selectcardprompt.js
     */
    promptForSelect(player, properties) {
        Contract.assertNotNullLike(player);

        this.queueStep(new SelectCardPrompt(this, player, properties));
    }

    /**
     * Prompt for distributing healing or damage among target cards.
     * Response data must be returned via {@link Game.statefulPromptResults}.
     *
     * @param {import('./gameSteps/PromptInterfaces.js').IDistributeAmongTargetsPromptProperties} properties
     */
    promptDistributeAmongTargets(player, properties) {
        Contract.assertNotNullLike(player);

        this.queueStep(new DistributeAmongTargetsPrompt(this, player, properties));
    }

    /**
     * This function is called by the client whenever a player clicks a button
     * in a prompt
     * @param {String} playerId
     * @param {String} arg - arg property of the button clicked
     * @param {String} uuid - unique identifier of the prompt clicked
     * @param {String} method - method property of the button clicked
     * @returns {Boolean} this indicates to the server whether the received input is legal or not
     */
    menuButton(playerId, arg, uuid, method) {
        var player = this.getPlayerById(playerId);

        // check to see if the current step in the pipeline is waiting for input
        return this.pipeline.handleMenuCommand(player, arg, uuid, method);
    }

    /**
     * This function is called by the client whenever a player clicks a "per card" button
     * in a prompt (e.g. Inferno Four prompt). See {@link DisplayCardsWithButtonsPrompt}.
     * @param {String} playerId
     * @param {String} arg - arg property of the button clicked
     * @param {String} uuid - unique identifier of the prompt clicked
     * @param {String} method - method property of the button clicked
     * @returns {Boolean} this indicates to the server whether the received input is legal or not
     */
    perCardMenuButton(playerId, arg, cardUuid, uuid, method) {
        var player = this.getPlayerById(playerId);

        // check to see if the current step in the pipeline is waiting for input
        return this.pipeline.handlePerCardMenuCommand(player, arg, cardUuid, uuid, method);
    }

    /**
     * Gets the results of a "stateful" prompt from the frontend. This is for more
     * involved prompts such as distributing damage / healing that require the frontend
     * to gather some state and send back, instead of just individual clicks.
     * @param {import('./gameSteps/PromptInterfaces.js').IStatefulPromptResults} result
     * @param {String} uuid - unique identifier of the prompt clicked
     */
    statefulPromptResults(playerId, result, uuid) {
        var player = this.getPlayerById(playerId);

        // check to see if the current step in the pipeline is waiting for input
        return this.pipeline.handleStatefulPromptResults(player, result, uuid);
    }

    /**
     * This function is called by the client when a player clicks an action window
     * toggle in the settings menu
     * @param {String} playerId
     * @param {String} windowName - the name of the action window being toggled
     * @param {Boolean} toggle - the new setting of the toggle
     */
    togglePromptedActionWindow(playerId, windowName, toggle) {
        var player = this.getPlayerById(playerId);
        if (!player) {
            return;
        }

        player.promptedActionWindows[windowName] = toggle;
    }

    /**
     * This function is called by the client when a player clicks an option setting
     * toggle in the settings menu
     * @param {String} playerId
     * @param {String} settingName - the name of the setting being toggled
     * @param {Boolean} toggle - the new setting of the toggle
     */
    toggleOptionSetting(playerId, settingName, toggle) {
        var player = this.getPlayerById(playerId);
        if (!player) {
            return;
        }

        player.optionSettings[settingName] = toggle;
    }

    toggleManualMode(playerName) {
        // this.chatCommands.manual(playerName);
    }

    /*
     * Sets up Player objects, creates allCards, starts the game pipeline
     */
    async initialiseAsync() {
        await Promise.all(this.getPlayers().map((player) => player.initialiseAsync()));

        this.state.allCards = this.getPlayers().reduce(
            (cards, player) => {
                return cards.concat(player.decklist.allCards);
            },
            []
        );

        this.resolveGameState(true);
        this.pipeline.initialise([
            new SetupPhase(this, this.snapshotManager),
            new SimpleStep(this, () => this.beginRound(), 'beginRound')
        ]);

        this.playStarted = true;
        this.startedAt = new Date();

        this.continue();
    }

    /*
     * Adds each of the game's main phases to the pipeline
     * @returns {undefined}
     */
    beginRound() {
        this.roundNumber++;
        this.actionPhaseActivePlayer = this.initiativePlayer;
        this.initializePipelineForRound();
    }

    /**
     * Initializes the pipeline for a new game round.
     * Accepts a parameter indicating whether this operation is due to a rollback, and if so, to what point in the round.
     *
     * @param {RollbackRoundEntryPoint | null} rollbackEntryPoint
     */
    initializePipelineForRound(rollbackEntryPoint = null) {
        const isRollback = rollbackEntryPoint != null;

        const roundStartStep = [];
        if (!isRollback || rollbackEntryPoint === RollbackRoundEntryPoint.StartOfRound) {
            roundStartStep.push(new SimpleStep(
                this, () => this.createEventAndOpenWindow(EventName.OnBeginRound, null, {}, TriggerHandlingMode.ResolvesTriggers), 'beginRound'
            ));
        }

        const actionPhaseStep = [];
        if (rollbackEntryPoint !== RollbackRoundEntryPoint.StartOfRegroupPhase) {
            let actionInitializeMode;

            switch (rollbackEntryPoint) {
                case RollbackRoundEntryPoint.StartOfRound:
                    actionInitializeMode = PhaseInitializeMode.RollbackToStartOfPhase;
                    break;
                case RollbackRoundEntryPoint.WithinActionPhase:
                    actionInitializeMode = PhaseInitializeMode.RollbackToWithinPhase;
                    break;
                case null:
                    actionInitializeMode = PhaseInitializeMode.Normal;
                    break;
                default:
                    Contract.fail(`Unknown rollback entry point: ${rollbackEntryPoint}`);
            }

            actionPhaseStep.push(new ActionPhase(this, () => this.getNextActionNumber(), this.snapshotManager, actionInitializeMode));
        }

        const regroupInitializeMode =
            rollbackEntryPoint === RollbackRoundEntryPoint.StartOfRegroupPhase
                ? PhaseInitializeMode.RollbackToStartOfPhase
                : PhaseInitializeMode.Normal;

        const regroupPhaseStep = [
            new RegroupPhase(this, this.snapshotManager, regroupInitializeMode)
        ];

        this.pipeline.initialise([
            ...roundStartStep,
            ...actionPhaseStep,
            ...regroupPhaseStep,
            new SimpleStep(this, () => this.roundEnded(), 'roundEnded'),
            new SimpleStep(this, () => this.beginRound(), 'beginRound')
        ]);
    }

    roundEnded() {
        this.createEventAndOpenWindow(EventName.OnRoundEnded, null, {}, TriggerHandlingMode.ResolvesTriggers);

        // at end of round, any tokens (except the Force tokens) in outsideTheGameZone are removed completely
        for (const player of this.getPlayers()) {
            for (const token of player.outsideTheGameZone.cards.filter((card) => card.isToken() && !card.isForceToken())) {
                this.removeTokenFromPlay(token);
            }
        }
    }

    getNextActionNumber() {
        this.actionNumber++;
        return this.actionNumber;
    }

    /**
     * @param { Player } player
     */
    claimInitiative(player) {
        this.initiativePlayer = player;
        this.isInitiativeClaimed = true;
        player.passedActionPhase = true;
        this.createEventAndOpenWindow(EventName.OnClaimInitiative, null, { player }, TriggerHandlingMode.ResolvesTriggers);

        // update game state for the sake of constant abilities that check initiative
        this.resolveGameState();
    }

    /**
     * Adds a step to the pipeline queue
     * @template {import('./gameSteps/IStep.js').IStep} TStep
     * @param {TStep} step
     * @returns {TStep}
     */
    queueStep(step) {
        this.pipeline.queueStep(step);
        return step;
    }

    /**
     * Creates a step which calls a handler function
     * @param {() => void} handler - () => void
     * @param {string} stepName
     */
    queueSimpleStep(handler, stepName) {
        this.pipeline.queueStep(new SimpleStep(this, handler, stepName));
    }

    /**
     * Resolves a card ability
     * @param {AbilityContext} context - see AbilityContext.js
     * @param {string[]} [ignoredRequirements=[]]
     * @returns {AbilityResolver}
     */
    resolveAbility(context, ignoredRequirements = []) {
        let resolver = new AbilityResolver(this, context, false, null, null, ignoredRequirements);
        this.queueStep(resolver);
        return resolver;
    }

    /**
     * Creates a game GameEvent, and opens a window for it.
     * @param {String} eventName
     * @param {AbilityContext} context - context for this event. Uses getFrameworkContext() to populate if null
     * @param {Object} params - parameters for this event
     * @param {TriggerHandlingMode} triggerHandlingMode - whether the EventWindow should make its own TriggeredAbilityWindow to resolve
     * after its events and any nested events
     * @param {(event: GameEvent) => void} handler - (GameEvent + params) => undefined
     * returns {GameEvent} - this allows the caller to track GameEvent.resolved and
     * tell whether or not the handler resolved successfully
     */
    createEventAndOpenWindow(eventName, context = null, params = {}, triggerHandlingMode = TriggerHandlingMode.PassesTriggersToParentWindow, handler = () => undefined) {
        let event = new GameEvent(eventName, context ?? this.getFrameworkContext(), params, handler);
        this.openEventWindow([event], triggerHandlingMode);
        return event;
    }

    /**
     * Directly emits an event to all listeners (does NOT open an event window)
     * @param {String} eventName
     * @param {AbilityContext} context - Uses getFrameworkContext() to populate if null
     * @param {Object} params - parameters for this event
     */
    emitEvent(eventName, context = null, params = {}) {
        let event = new GameEvent(eventName, context ?? this.getFrameworkContext(), params);
        this.emit(event.name, event);
    }

    /**
     * Creates an EventWindow which will open windows for each kind of triggered
     * ability which can respond any passed events, and execute their handlers.
     * @param events
     * @param {TriggerHandlingMode} triggerHandlingMode
     * @returns {EventWindow}
     */
    openEventWindow(events, triggerHandlingMode = TriggerHandlingMode.PassesTriggersToParentWindow) {
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
    addSubwindowEvents(events) {
        this.currentEventWindow.addSubwindowEvents(events);
    }

    // /**
    //  * Raises a custom event window for checking for any cancels to a card
    //  * ability
    //  * @param {Object} params
    //  * @param {Function} handler - this is an arrow function which is called if
    //  * nothing cancels the event
    //  */
    // raiseInitiateAbilityEvent(params, handler) {
    //     this.raiseMultipleInitiateAbilityEvents([{ params: params, handler: handler }]);
    // }

    // /**
    //  * Raises a custom event window for checking for any cancels to several card
    //  * abilities which initiate simultaneously
    //  * @param {Array} eventProps
    //  */
    // raiseMultipleInitiateAbilityEvents(eventProps) {
    //     let events = eventProps.map((event) => new InitiateCardAbilityEvent(event.params, event.handler));
    //     this.queueStep(new InitiateAbilityEventWindow(this, events));
    // }

    // /**
    //  * Checks whether a game action can be performed on a card or an array of
    //  * cards, and performs it on all legal targets.
    //  * @param {AbilityContext} context
    //  * @param {Object} actions - Object with { actionName: targets }
    //  * @returns {GameEvent[]}
    //  */
    // applyGameAction(context, actions) {
    //     if (!context) {
    //         context = this.getFrameworkContext();
    //     }
    //     let actionPairs = Object.entries(actions);
    //     let events = actionPairs.reduce((array, [action, cards]) => {
    //         action = action === 'break' ? 'breakProvince' : action;
    //         const gameActionFactory = GameSystems[action];
    //         if (typeof gameActionFactory === 'function') {
    //             const gameSystem = gameActionFactory({ target: cards });
    //             array.push(...gameSystem.queueGenerateEventGameSteps(context));
    //         }
    //         return array;
    //     }, []);
    //     if (events.length > 0) {
    //         this.openEventWindow(events);
    //     }
    //     return events;
    // }

    /**
     * @param {Player} player
     * @returns {AbilityContext}
     */
    getFrameworkContext(player = null) {
        return new AbilityContext({ game: this, player: player });
    }

    // initiateConflict(player, canPass, forcedDeclaredType, forceProvinceTarget) {
    //     const conflict = new Conflict(
    //         this,
    //         player,
    //         player.opponent,
    //         null,
    //         forceProvinceTarget ?? null,
    //         forcedDeclaredType
    //     );
    //     this.queueStep(new ConflictFlow(this, conflict, canPass));
    // }

    // updateCurrentConflict(conflict) {
    //     this.currentConflict = conflict;
    //     this.resolveGameState(true);
    // }

    // /**
    //  * Changes the controller of a card in play to the passed player, and cleans
    //  * all the related stuff up
    //  * @param {Player} player
    //  * @param card
    //  */
    // takeControl(player, card) {
    //     if (
    //         card.controller === player ||
    //         card.hasRestriction(EffectName.TakeControl, this.getFrameworkContext())
    //     ) {
    //         return;
    //     }
    //     if (!Contract.assertNotNullLike(player)) {
    //         return;
    //     }
    //     card.controller.removeCardFromPile(card);
    //     player.cardsInPlay.push(card);
    //     card.controller = player;
    //     if (card.isParticipating()) {
    //         this.currentConflict.removeFromConflict(card);
    //         if (player.isAttackingPlayer()) {
    //             this.currentConflict.addAttacker(card);
    //         } else {
    //             this.currentConflict.addDefender(card);
    //         }
    //     }
    //     card.updateEffectContexts();
    //     this.resolveGameState(true);
    // }

    watch(socketId, user) {
        if (!this.allowSpectators) {
            return false;
        }

        this.playersAndSpectators[user.username] = new Spectator(socketId, user);
        this.addMessage('{0} has joined the game as a spectator', user.username);

        return true;
    }

    join(socketId, user) {
        if (this.started || this.getPlayers().length === 2) {
            return false;
        }

        this.playersAndSpectators[user.username] = new Player(socketId, user, this);

        return true;
    }

    // isEmpty() {
    //     return _.all(this.playersAndSpectators, (player) => player.disconnected || player.left || player.id === 'TBA');
    // }

    leave(playerName) {
        var player = this.playersAndSpectators[playerName];

        if (!player) {
            return;
        }

        this.addMessage('{0} has left the game', playerName);

        if (this.isSpectator(player) || !this.started) {
            delete this.playersAndSpectators[playerName];
        } else {
            player.left = true;

            if (!this.finishedAt) {
                this.finishedAt = new Date();
            }
        }
    }

    disconnect(playerName) {
        var player = this.playersAndSpectators[playerName];

        if (!player) {
            return;
        }

        this.addMessage('{0} has disconnected', player);

        if (this.isSpectator(player)) {
            delete this.playersAndSpectators[playerName];
        } else {
            player.disconnected = true;
            player.socket = undefined;
        }
    }

    failedConnect(playerName) {
        var player = this.playersAndSpectators[playerName];

        if (!player) {
            return;
        }

        if (this.isSpectator(player) || !this.started) {
            delete this.playersAndSpectators[playerName];
        } else {
            this.addMessage('{0} has failed to connect to the game', player);

            player.disconnected = true;

            if (!this.finishedAt) {
                this.finishedAt = new Date();
            }
        }
    }

    reconnect(socket, playerName) {
        var player = this.getPlayerByName(playerName);
        if (!player) {
            return;
        }

        player.id = socket.id;
        player.socket = socket;
        player.disconnected = false;

        this.addMessage('{0} has reconnected', player);
    }

    /** @param {CostAdjuster} costAdjuster */
    removeCostAdjusterFromAll(costAdjuster) {
        for (const player of this.getPlayers()) {
            player.removeCostAdjuster(costAdjuster);
        }
    }

    /** Goes through the list of cards moved during event resolution and does a uniqueness rule check for each */
    checkUniqueRule() {
        const checkedCards = new Array();

        for (const movedCard of this.movedCards) {
            if (EnumHelpers.isArena(movedCard.zoneName) && movedCard.unique) {
                const existingCard = checkedCards.find((otherCard) =>
                    otherCard.title === movedCard.title &&
                    otherCard.subtitle === movedCard.subtitle &&
                    otherCard.controller === movedCard.controller
                );

                if (!existingCard) {
                    checkedCards.push(movedCard);
                    movedCard.checkUnique();
                }
            }
        }
    }

    resolveGameState(hasChanged = false, events = []) {
        // first go through and enable / disabled abilities for cards that have been moved in or out of the arena
        for (const movedCard of this.movedCards) {
            movedCard.resolveAbilitiesForNewZone();
        }
        this.movedCards = [];

        if (events.length > 0) {
            // check for any delayed effects which need to fire
            this.ongoingEffectEngine.checkDelayedEffects(events);
        }

        // check for a game state change (recalculating attack stats if necessary)
        if (
            // (!this.currentAttack && this.ongoingEffectEngine.resolveEffects(hasChanged)) ||
            this.ongoingEffectEngine.resolveEffects(hasChanged) || hasChanged
        ) {
            this.checkWinCondition();
            // if the state has changed, check for:

            // - any defeated units
            this.findAnyCardsInPlay((card) => card.isUnit()).forEach((card) => card.checkDefeatedByOngoingEffect());
        }
    }

    continue() {
        this.pipeline.continue(this);
    }

    /**
     * Receives data for the token cards and builds a factory method for each type
     * @param {*} tokenCardsData object in the form `{ tokenName: tokenCardData }`
     */
    initialiseTokens(tokenCardsData) {
        this.checkTokenDataProvided(TokenUpgradeName, tokenCardsData);
        this.checkTokenDataProvided(TokenUnitName, tokenCardsData);
        this.checkTokenDataProvided(TokenCardName, tokenCardsData);

        this.tokenFactories = {};

        for (const [tokenName, cardData] of Object.entries(tokenCardsData)) {
            const tokenConstructor = cards.get(cardData.id);

            Contract.assertNotNullLike(tokenConstructor, `Token card data for ${tokenName} contained unknown id '${cardData.id}'`);

            this.tokenFactories[tokenName] = (player, additionalProperties) => new tokenConstructor(player, cardData, additionalProperties);
        }
    }

    checkTokenDataProvided(tokenTypeNames, tokenCardsData) {
        for (const tokenName of Object.values(tokenTypeNames)) {
            if (!(tokenName in tokenCardsData)) {
                throw new Error(`Token type '${tokenName}' was not included in token data for game initialization`);
            }
        }
    }

    /**
     * Creates a new token in an out of play zone owned by the player and
     * adds it to all relevant card lists
     * @param {Player} player
     * @param {import('./Constants.js').TokenName} tokenName
     * @param {any} additionalProperties
     * @returns {Card}
     */
    generateToken(player, tokenName, additionalProperties = null) {
        /** @type {import('./card/propertyMixins/Token.js').ITokenCard} */
        const token = this.tokenFactories[tokenName](player, additionalProperties);

        // TODO: Rework allCards to be GO Refs
        this.state.allCards.push(token.getRef());
        player.decklist.tokens.push(token.getRef());
        player.decklist.allCards.push(token.getRef());
        player.outsideTheGameZone.addCard(token);
        token.initializeZone(player.outsideTheGameZone);

        return token;
    }

    /**
     * Removes a shield token from all relevant card lists, including its zone
     * @param {import('./card/propertyMixins/Token.js').ITokenCard} token
     */
    removeTokenFromPlay(token) {
        Contract.assertEqual(token.zoneName, ZoneName.OutsideTheGame,
            `Tokens must be moved to zone ${ZoneName.OutsideTheGame} before removing from play, instead found token at ${token.zoneName}`
        );

        const player = token.owner;
        // Functionality did nothing previously, now that it's fixed, disabling until we're ready to activate again.
        // this.filterCardFromList(token, this.state.allCards);
        // this.filterCardFromList(token, player.decklist.tokens);
        // this.filterCardFromList(token, player.decklist.allCards);
        token.removeFromGame();
    }

    /**
     * Registers that a card has been moved to a different zone and therefore requires updating in the
     * next call to resolveGameState
     * @param {Card} card
     */
    registerMovedCard(card) {
        this.movedCards.push(card);
    }

    /**
     *
     * @param {Card} removeCard
     * @param {import('./GameObjectBase.js').GameObjectRef[]} list
     */
    filterCardFromList(removeCard, list) {
        const indexes = [];

        for (let i = list.length - 1; i >= 0; i--) {
            const ref = list[i];
            if (ref.uuid === removeCard.uuid) {
                indexes.push(i);
            }
        }

        for (let index of indexes) {
            list.splice(index, 1);
        }
    }

    // formatDeckForSaving(deck) {
    //     var result = {
    //         faction: {},
    //         conflictCards: [],
    //         dynastyCards: [],
    //         stronghold: undefined,
    //         role: undefined
    //     };

    //     //faction
    //     result.faction = deck.faction;

    //     //conflict
    //     deck.conflictCards.forEach((cardData) => {
    //         if (cardData && cardData.card) {
    //             result.conflictCards.push(`${cardData.count}x ${cardData.card.id}`);
    //         }
    //     });

    //     //dynasty
    //     deck.dynastyCards.forEach((cardData) => {
    //         if (cardData && cardData.card) {
    //             result.dynastyCards.push(`${cardData.count}x ${cardData.card.id}`);
    //         }
    //     });

    //     //stronghold & role
    //     if (deck.stronghold) {
    //         deck.stronghold.forEach((cardData) => {
    //             if (cardData && cardData.card) {
    //                 result.stronghold = cardData.card.id;
    //             }
    //         });
    //     }
    //     if (deck.role) {
    //         deck.role.forEach((cardData) => {
    //             if (cardData && cardData.card) {
    //                 result.role = cardData.card.id;
    //             }
    //         });
    //     }

    //     return result;
    // }

    // /*
    //  * This information is all logged when a game is won
    //  */
    // getSaveState() {
    //     const players = this.getPlayers().map((player) => ({
    //         name: player.name,
    //         faction: player.faction.name || player.faction.value,
    //         honor: player.getTotalHonor(),
    //         lostProvinces: player
    //             .getProvinceCards()
    //             .reduce((count, card) => (card && card.isBroken ? count + 1 : count), 0),
    //         deck: this.formatDeckForSaving(player.deck)
    //     }));

    //     return {
    //         id: this.savedGameId,
    //         gameId: this.id,
    //         startedAt: this.startedAt,
    //         players: players,
    //         winner: this.winner ? this.winner.name : undefined,
    //         gameEndReason: this.gameEndReason,
    //         gameMode: this.gameMode,
    //         finishedAt: this.finishedAt,
    //         roundNumber: this.roundNumber,
    //         initialFirstPlayer: this.initialFirstPlayer
    //     };
    // }

    /**
     * @template {GameObjectBase} T
     * @param {import('./GameObjectBase.js').GameObjectRef<T>} gameRef
     * @returns {T | null}
     */
    getFromRef(gameRef) {
        return this.gameObjectManager.get(gameRef);
    }

    // /*
    //  * This information is sent to the client
    //  */
    getState(notInactivePlayerId) {
        let activePlayer = this.playersAndSpectators[notInactivePlayerId] || new AnonymousSpectator();
        let playerState = {};
        if (this.started) {
            for (const player of this.getPlayers()) {
                playerState[player.id] = player.getStateSummary(activePlayer);
            }

            const gameState = {
                playerUpdate: activePlayer.name,
                id: this.id,
                manualMode: this.manualMode,
                owner: this.owner,
                players: playerState,
                phase: this.currentPhase,
                messages: this.gameChat.messages,
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
                winners: this.winnerNames
            };

            // clean out any properies that are null or undefined to reduce the message size
            Helpers.deleteEmptyPropertiesRecursiveInPlace(gameState);

            return gameState;
        }
        return {};
    }

    /** @param {string} playerId */
    countAvailableActionSnapshots(playerId) {
        Contract.assertNotNullLike(playerId);
        return this.snapshotManager.countAvailableActionSnapshots(playerId);
    }

    /** @param {string} playerId */
    countAvailableManualSnapshots(playerId) {
        Contract.assertNotNullLike(playerId);
        return this.snapshotManager.countAvailableManualSnapshots(playerId);
    }

    /** @param {PhaseName.Action | PhaseName.Regroup} phaseName */
    countAvailablePhaseSnapshots(phaseName) {
        Contract.assertNotNullLike(phaseName);
        return this.snapshotManager.countAvailablePhaseSnapshots(phaseName);
    }

    /**
     * Takes a manual snapshot of the current game state for the given player
     *
     * @param {Player} player - The player for whom the snapshot is taken
     */
    takeManualSnapshot(player) {
        if (this.isUndoEnabled) {
            Contract.assertHasProperty(player, 'id', 'Player must have an id to take a manual snapshot');
            return this.snapshotManager.takeSnapshot({ type: SnapshotType.Manual, playerId: player.id });
        }

        return -1;
    }

    /**
     * Attempts to restore the designated snapshot
     *
     * @param {import('./snapshot/SnapshotInterfaces.js').IGetSnapshotSettings} settings - Settings for the snapshot restoration
     * @returns True if a snapshot was restored, false otherwise
     */
    // TODO playerId at the beginning is currently needed if we want to send commands from the Lobby.
    rollbackToSnapshot(playerId, settings) {
        if (!this.isUndoEnabled) {
            return false;
        }

        const rollbackResult = this.snapshotManager.rollbackTo(settings);

        if (!rollbackResult.success) {
            return false;
        }

        this.postRollbackOperations(rollbackResult.roundEntryPoint);

        return true;
    }

    postRollbackOperations(roundEntryPoint = null) {
        this.pipeline.clearSteps();
        this.initializeCurrentlyResolving();
        this.initializePipelineForRound(roundEntryPoint);
        this.pipeline.continue(this);
    }

    // TODO: Make a debug object type.
    /**
     * Should only be used for manual testing inside of unit tests, *never* committing any usage into main.
     * @param {{ pipeline: boolean; }} settings
     * @param {() => void} fcn
     */
    debug(settings, fcn) {
        const currDebug = this.#debug;
        if (Helpers.isDevelopment) {
            this.#debug = settings;
        }
        try {
            fcn();
        } finally {
            this.#debug = currDebug;
        }
    }

    /**
     * Should only be used for manual testing inside of unit tests, *never* committing any usage into main.
     * @param {() => void} fcn
     */
    debugPipeline(fcn) {
        this.#debug.pipeline = Helpers.isDevelopment();
        try {
            fcn();
        } finally {
            this.#debug.pipeline = false;
        }
    }

    /**
     * Captures the current game state for a bug report
     * @param reportingPlayer
     * @returns A simplified game state representation
     */
    captureGameState(reportingPlayer) {
        if (!this) {
            return {
                phase: 'unknown',
                player1: {},
                player2: {}
            };
        }
        const players = this.getPlayers();
        if (players.length !== 2) {
            return {
                phase: this.currentPhase,
                player1: {},
                player2: {}
            };
        }
        let player1, player2;

        switch (reportingPlayer) {
            case players[0].id:
                player1 = players[0];
                player2 = players[1];
                break;
            case players[1].id:
                player1 = players[1];
                player2 = players[0];
                break;
            case 'testrun':
                player1 = players[0];
                player2 = players[1];
                break;
            default:
                Contract.fail(`Reporting player ${reportingPlayer} is not a player in this game`);
        }
        return {
            phase: this.currentPhase,
            player1: player1.capturePlayerState('player1'),
            player2: player2.capturePlayerState('player2'),
        };
    }

    // return this.getSummary(notInactivePlayerName);
    // }

    // /*
    //  * This is used for debugging?
    //  */
    // getSummary(notInactivePlayerName) {
    //     var playerSummaries = {};

    //     for (const player of this.getPlayers()) {
    //         var deck = undefined;
    //         if (player.left) {
    //             return;
    //         }

    //         if (notInactivePlayerName === player.name && player.deck) {
    //             deck = { name: player.deck.name, selected: player.deck.selected };
    //         } else if (player.deck) {
    //             deck = { selected: player.deck.selected };
    //         } else {
    //             deck = {};
    //         }

    //         playerSummaries[player.name] = {
    //             deck: deck,
    //             emailHash: player.emailHash,
    //             faction: player.faction.value,
    //             id: player.id,
    //             lobbyId: player.lobbyId,
    //             left: player.left,
    //             name: player.name,
    //             owner: player.owner
    //         };
    //     }

    //     return {
    //         allowSpectators: this.allowSpectators,
    //         createdAt: this.createdAt,
    //         gameType: this.gameType,
    //         id: this.id,
    //         manualMode: this.manualMode,
    //         messages: this.gameChat.messages,
    //         name: this.name,
    //         owner: _.omit(this.owner, ['blocklist', 'email', 'emailHash', 'promptedActionWindows', 'settings']),
    //         players: playerSummaries,
    //         started: this.started,
    //         startedAt: this.startedAt,
    //         gameMode: this.gameMode,
    //         spectators: this.getSpectators().map((spectator) => {
    //             return {
    //                 id: spectator.id,
    //                 lobbyId: spectator.lobbyId,
    //                 name: spectator.name
    //             };
    //         })
    //     };
    // }
}

module.exports = Game;
