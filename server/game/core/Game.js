const EventEmitter = require('events');

const ChatCommands = require('./chat/ChatCommands.js');
const { GameChat } = require('./chat/GameChat.js');
const { OngoingEffectEngine } = require('./ongoingEffect/OngoingEffectEngine.js');
const Player = require('./Player.js');
const { Spectator } = require('../../Spectator.js');
const { AnonymousSpectator } = require('../../AnonymousSpectator.js');
const { GamePipeline } = require('./GamePipeline.js');
const { SetupPhase } = require('./gameSteps/phases/SetupPhase.js');
const { ActionPhase } = require('./gameSteps/phases/ActionPhase.js');
const { RegroupPhase } = require('./gameSteps/phases/RegroupPhase.js');
const { SimpleStep } = require('./gameSteps/SimpleStep.js');
const MenuPrompt = require('./gameSteps/prompts/MenuPrompt.js');
const HandlerMenuPrompt = require('./gameSteps/prompts/HandlerMenuPrompt.js');
const SelectCardPrompt = require('./gameSteps/prompts/SelectCardPrompt.js');
const GameWonPrompt = require('./gameSteps/prompts/GameWonPrompt.js');
const GameSystems = require('../gameSystems/GameSystemLibrary.js');
const { GameEvent } = require('./event/GameEvent.js');
const InitiateCardAbilityEvent = require('./event/InitiateCardAbilityEvent.js');
const EventWindow = require('./event/EventWindow.js');
const ThenEventWindow = require('./event/ThenEventWindow.js');
const InitiateAbilityEventWindow = require('./gameSteps/abilityWindow/InitiateAbilityEventWindow.js');
const AbilityResolver = require('./gameSteps/AbilityResolver.js');
const { SimultaneousEffectWindow } = require('./gameSteps/SimultaneousEffectWindow.js');
const { AbilityContext } = require('./ability/AbilityContext.js');
const Contract = require('./utils/Contract');
const { cards } = require('../cards/Index.js');
// const { Conflict } = require('./conflict.js');
// const ConflictFlow = require('./gamesteps/conflict/conflictflow.js');
// const MenuCommands = require('./MenuCommands');

const { EffectName, EventName, Location, TokenName } = require('./Constants.js');
const { BaseStepWithPipeline } = require('./gameSteps/BaseStepWithPipeline.js');
const { default: Shield } = require('../cards/01_SOR/Shield.js');

class Game extends EventEmitter {
    constructor(details, options = {}) {
        super();

        this.ongoingEffectEngine = new OngoingEffectEngine(this);
        this.playersAndSpectators = {};
        this.gameChat = new GameChat();
        this.chatCommands = new ChatCommands(this);
        this.pipeline = new GamePipeline();
        this.id = details.id;
        this.name = details.name;
        this.allowSpectators = details.allowSpectators;
        this.spectatorSquelch = details.spectatorSquelch;
        this.owner = details.owner;
        this.started = false;
        this.playStarted = false;
        this.createdAt = new Date();
        this.savedGameId = details.savedGameId;
        this.gameType = details.gameType;
        this.currentAbilityWindow = null;
        this.currentActionWindow = null;
        this.currentEventWindow = null;
        this.currentAttack = null;
        this.manualMode = false;
        this.gameMode = details.gameMode;
        this.currentPhase = null;
        this.password = details.password;
        this.roundNumber = 0;
        this.initialFirstPlayer = null;
        this.initiativePlayer = null;
        this.actionPhaseActivePlayer = null;
        this.tokenFactories = null;

        this.shortCardData = options.shortCardData || [];

        details.players.forEach((player) => {
            this.playersAndSpectators[player.user.username] = new Player(
                player.id,
                player.user,
                this.owner === player.user.username,
                this,
                details.clocks
            );
        });

        details.spectators?.forEach((spectator) => {
            this.playersAndSpectators[spectator.user.username] = new Spectator(spectator.id, spectator.user);
        });

        this.setMaxListeners(0);

        this.router = options.router;
    }


    /*
     * Reports errors from the game engine back to the router
     * @param {type} e
     * @returns {undefined}
     */
    reportError(e) {
        this.router.handleError(this, e);
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
     * @param {String} one of: 'endofround', 'success', 'info', 'danger', 'warning'
     * @param {String} message to display (can include {i} references to args)
     * @param {Array} args to match the references in @string
     */
    addAlert() {
        // @ts-expect-error
        this.gameChat.addAlert(...arguments);
    }

    get messages() {
        return this.gameChat.messages;
    }

    /**
     * Checks if a player is a spectator
     * @param {Object} player
     * @returns {Boolean}
     */
    isSpectator(player) {
        return player.constructor === Spectator;
    }

    /**
     * Checks whether a player/spectator is still in the game
     * @param {String} playerName
     * @returns {Boolean}
     */
    hasPlayerNotInactive(playerName) {
        return this.playersAndSpectators[playerName] && !this.playersAndSpectators[playerName].left;
    }

    /**
     * Get all players (not spectators) in the game
     * @returns {Player[]}
     */
    getPlayers() {
        return Object.values(this.playersAndSpectators).filter((player) => !this.isSpectator(player));
    }

    /**
     * Returns the Player object (not spectator) for a name
     * @param {String} playerName
     * @returns {Player}
     */
    getPlayerByName(playerName) {
        if (!Contract.assertHasProperty(this.playersAndSpectators, playerName)) {
            return null;
        }

        let player = this.playersAndSpectators[playerName];
        if (!Contract.assertFalse(this.isSpectator(player), `Player ${playerName} is a spectator`)) {
            return null;
        }

        return player;
    }

    /**
     * Get all players (not spectators) with the first player at index 0
     * @returns {Player[]} Array of Player objects
     */
    getPlayersInInitiativeOrder() {
        return this.getPlayers().sort((a) => (a.hasInitiative() ? -1 : 1));
    }

    /**
     * Get all players and spectators in the game
     * @returns {Object} {name1: Player, name2: Player, name3: Spectator}
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

    /**
     * Checks who the next legal active player for the action phase should be and updates @member {activePlayer}. If none available, sets it to null.
     */
    rotateActivePlayer() {
        if (!this.actionPhaseActivePlayer.opponent.passedActionPhase) {
            this.createEventAndOpenWindow(
                EventName.OnPassActionPhasePriority,
                { player: this.actionPhaseActivePlayer, actionWindow: this },
                () => {
                    this.actionPhaseActivePlayer = this.actionPhaseActivePlayer.opponent;
                }
            );
        } else if (this.actionPhaseActivePlayer.passedActionPhase) {
            this.actionPhaseActivePlayer = null;
        }

        // by default, if the opponent has passed and the active player has not, they remain the active player and play continues
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
     * @param {Function} predicate - card => Boolean
     * @returns {Array} Array of DrawCard objects
     */
    findAnyCardsInPlay(predicate) {
        var foundCards = [];

        this.getPlayers().forEach((player) => {
            foundCards = foundCards.concat(player.findCards(player.getArenaCards(), predicate));
        });

        return foundCards;
    }

    /**
     * Returns if a card is in play (units, upgrades, base, leader) that has the passed trait
     * @param {string} trait
     * @returns {boolean} true/false if the trait is in pay
     */
    isTraitInPlay(trait) {
        return this.getPlayers().some((player) => player.isTraitInPlay(trait));
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

    stopNonChessClocks() {
        this.getPlayers().forEach((player) => player.stopNonChessClocks());
    }

    stopClocks() {
        this.getPlayers().forEach((player) => player.stopClock());
    }

    resetClocks() {
        this.getPlayers().forEach((player) => player.resetClock());
    }

    // TODO: parameter contract checks for this flow
    /**
     * This function is called from the client whenever a card is clicked
     * @param {String} sourcePlayer - name of the clicking player
     * @param {String} cardId - uuid of the card clicked
     */
    cardClicked(sourcePlayer, cardId) {
        var player = this.getPlayerByName(sourcePlayer);

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

    // TODO SMUGGLE: implementation of this
    // facedownCardClicked(playerName, location, controllerName, isProvince = false) {
    //     let player = this.getPlayerByName(playerName);
    //     let controller = this.getPlayerByName(controllerName);
    //     if (!player || !controller) {
    //         return;
    //     }
    //     let list = controller.getCardPile(location);
    //     if (!list) {
    //         return;
    //     }
    //     let card = list.find((card) => !isProvince === !card.isProvince);
    //     if (card) {
    //         return this.pipeline.handleCardClicked(player, card);
    //     }
    // }

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
    //  * Check to see if either player has won/lost the game due to honor (NB: this
    //  * function doesn't check to see if a conquest victory has been achieved)
    //  */
    // checkWinCondition() {
    //     let honorRequiredToWin = this.gameMode === GameMode.Skirmish ? 12 : 25;
    //     for (const player of this.getPlayersInFirstPlayerOrder()) {
    //         if (player.honor >= honorRequiredToWin) {
    //             this.recordWinner(player, 'honor');
    //         } else if (player.opponent && player.opponent.honor <= 0) {
    //             this.recordWinner(player, 'dishonor');
    //         }
    //     }
    // }

    /**
     * Display message declaring victory for one player, and record stats for
     * the game
     * @param {Player} winner
     * @param {String} reason
     */
    recordWinner(winner, reason) {
        if (this.winner) {
            return;
        }

        this.addMessage('{0} has won the game', winner);

        this.winner = winner;
        this.finishedAt = new Date();
        this.winReason = reason;

        this.router.gameWon(this, reason, winner);

        this.queueStep(new GameWonPrompt(this, winner));
    }

    /**
     * Changes a Player variable and displays a message in chat
     * @param {String} playerName
     * @param {String} stat
     * @param {Number} value
     */
    changeStat(playerName, stat, value) {
        var player = this.getPlayerByName(playerName);
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

    // /**
    //  * This function is called by the client every time a player enters a chat message
    //  * @param {String} playerName
    //  * @param {String} message
    //  */
    // chat(playerName, message) {
    //     var player = this.playersAndSpectators[playerName];
    //     var args = message.split(' ');

    //     if (!player) {
    //         return;
    //     }

    //     if (!this.isSpectator(player)) {
    //         if (this.chatCommands.executeCommand(player, args[0], args)) {
    //             this.resolveGameState(true);
    //             return;
    //         }

    //         let card = _.find(this.shortCardData, (c) => {
    //             return c.name.toLowerCase() === message.toLowerCase() || c.id.toLowerCase() === message.toLowerCase();
    //         });

    //         if (card) {
    //             this.gameChat.addChatMessage(player, { message: this.gameChat.formatMessage('{0}', [card]) });

    //             return;
    //         }
    //     }

    //     if (!this.isSpectator(player) || !this.spectatorSquelch) {
    //         this.gameChat.addChatMessage(player, message);
    //     }
    // }

    /**
     * This is called by the client when a player clicks 'Concede'
     * @param {String} playerName
     */
    concede(playerName) {
        var player = this.getPlayerByName(playerName);

        if (!player) {
            return;
        }

        this.addMessage('{0} concedes', player);

        var otherPlayer = this.getOtherPlayer(player);

        if (otherPlayer) {
            this.recordWinner(otherPlayer, 'concede');
        }
    }

    selectDeck(playerName, deck) {
        let player = this.getPlayerByName(playerName);
        if (player) {
            player.selectDeck(deck);
        }
    }

    /**
     * Called when a player clicks Shuffle Deck on the conflict deck menu in
     * the client
     * @param {String} playerName
     */
    shuffleDeck(playerName) {
        let player = this.getPlayerByName(playerName);
        if (player) {
            player.shuffleDeck();
        }
    }

    /**
     * Prompts a player with a multiple choice menu
     * @param {Player} player
     * @param {Object} contextObj - the object which contains the methods that are referenced by the menubuttons
     * @param {Object} properties - see menuprompt.js
     */
    promptWithMenu(player, contextObj, properties) {
        if (!Contract.assertNotNullLike(player)) {
            return;
        }

        this.queueStep(new MenuPrompt(this, player, contextObj, properties));
    }

    /**
     * Prompts a player with a multiple choice menu
     * @param {Player} player
     * @param {Object} properties - see handlermenuprompt.js
     */
    promptWithHandlerMenu(player, properties) {
        if (!Contract.assertNotNullLike(player)) {
            return;
        }

        this.queueStep(new HandlerMenuPrompt(this, player, properties));
    }

    /**
     * Prompts a player to click a card
     * @param {Player} player
     * @param {Object} properties - see selectcardprompt.js
     */
    promptForSelect(player, properties) {
        if (!Contract.assertNotNullLike(player)) {
            return;
        }

        this.queueStep(new SelectCardPrompt(this, player, properties));
    }

    /**
     * This function is called by the client whenever a player clicks a button
     * in a prompt
     * @param {String} playerName
     * @param {String} arg - arg property of the button clicked
     * @param {String} uuid - unique identifier of the prompt clicked
     * @param {String} method - method property of the button clicked
     * @returns {Boolean} this indicates to the server whether the received input is legal or not
     */
    menuButton(playerName, arg, uuid, method) {
        var player = this.getPlayerByName(playerName);
        if (!player) {
            return false;
        }

        // check to see if the current step in the pipeline is waiting for input
        return this.pipeline.handleMenuCommand(player, arg, uuid, method);
    }

    /**
     * This function is called by the client when a player clicks an action window
     * toggle in the settings menu
     * @param {String} playerName
     * @param {String} windowName - the name of the action window being toggled
     * @param {Boolean} toggle - the new setting of the toggle
     * @returns {undefined}
     */
    togglePromptedActionWindow(playerName, windowName, toggle) {
        var player = this.getPlayerByName(playerName);
        if (!player) {
            return;
        }

        player.promptedActionWindows[windowName] = toggle;
    }

    /**
     * This function is called by the client when a player clicks an timer setting
     * toggle in the settings menu
     * @param {String} playerName
     * @param {String} settingName - the name of the setting being toggled
     * @param {Boolean} toggle - the new setting of the toggle
     * @returns {undefined}
     */
    toggleTimerSetting(playerName, settingName, toggle) {
        var player = this.getPlayerByName(playerName);
        if (!player) {
            return;
        }

        player.timerSettings[settingName] = toggle;
    }

    /*
     * This function is called by the client when a player clicks an option setting
     * toggle in the settings menu
     * @param {String} playerName
     * @param {String} settingName - the name of the setting being toggled
     * @param {Boolean} toggle - the new setting of the toggle
     * @returns {undefined}
     */
    toggleOptionSetting(playerName, settingName, toggle) {
        var player = this.getPlayerByName(playerName);
        if (!player) {
            return;
        }

        player.optionSettings[settingName] = toggle;
    }

    toggleManualMode(playerName) {
        this.chatCommands.manual(playerName);
    }

    /*
     * Sets up Player objects, creates allCards, checks each player has a stronghold
     * and starts the game pipeline
     * @returns {undefined}
     */
    initialise() {
        // // check if player has left the game
        // var players = {};
        // _.each(this.playersAndSpectators, (player) => {
        //     if (!player.left) {
        //         players[player.name] = player;
        //     }
        // });
        // this.playersAndSpectators = players;

        // TODO: turn this check into a base + leader check (or merge with deck check somewhere else?)
        let playerWithNoStronghold = null;

        for (let player of this.getPlayers()) {
            player.initialise();
            // if (this.gameMode !== GameMode.Skirmish && !player.stronghold) {
            //     playerWithNoStronghold = player;
            // }
        }

        this.allCards = this.getPlayers().reduce(
            (cards, player) => {
                return cards.concat(player.decklist.allCards);
            },
            []
        );

        // if (this.gameMode !== GameMode.Skirmish) {
        //     if (playerWithNoStronghold) {
        //         this.queueSimpleStep(() => {
        //             this.addMessage(
        //                 'Invalid Deck Detected: {0} does not have a stronghold in their decklist',
        //                 playerWithNoStronghold
        //             );
        //             return false;
        //         });
        //         this.continue();
        //         return false;
        //     }

        //     for (let player of this.getPlayers()) {
        //         let numProvinces = this.provinceCards.filter((a) => a.controller === player);
        //         if (numProvinces.length !== 5) {
        //             this.queueSimpleStep(() => {
        //                 this.addMessage('Invalid Deck Detected: {0} has {1} provinces', player, numProvinces.length);
        //                 return false;
        //             });
        //             this.continue();
        //             return false;
        //         }
        //     }
        // }

        this.pipeline.initialise([new SetupPhase(this), new SimpleStep(this, () => this.beginRound(), 'beginRound')]);

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
        this.createEventAndOpenWindow(EventName.OnBeginRound);
        this.queueStep(new ActionPhase(this));
        this.queueStep(new RegroupPhase(this));
        this.queueSimpleStep(() => this.roundEnded(), 'roundEnded');
        this.queueSimpleStep(() => this.beginRound(), 'beginRound');
    }

    roundEnded() {
        this.createEventAndOpenWindow(EventName.OnRoundEnded);
    }

    claimInitiative(player) {
        this.addMessage('{0} claims initiative', player);

        this.initiativePlayer = player;
        player.passedActionPhase = true;

        // TODO: eventually we'll probably need an event window here

        // update game state for the sake of constant abilities that check initiative
        this.resolveGameState();
    }

    /*
     * Adds a step to the pipeline queue
     * @param {BaseStep} step
     * @returns {undefined}
     */
    queueStep(step) {
        this.pipeline.queueStep(step);
        return step;
    }

    /*
     * Creates a step which calls a handler function
     * @param {Function} handler - () => undefined
     * @returns {undefined}
     */
    queueSimpleStep(handler, stepName) {
        this.pipeline.queueStep(new SimpleStep(this, handler, stepName));
    }

    /*
     * Tells the current action window that the player with priority has taken
     * an action (and so priority should pass to the other player)
     * @returns {undefined}
     */
    markActionAsTaken() {
        if (this.currentActionWindow) {
            this.currentActionWindow.markActionAsTaken();
        }
    }

    /*
     * Resolves a card ability
     * @param {AbilityContext} context - see AbilityContext.js
     * @returns {undefined}
     */
    resolveAbility(context) {
        let resolver = new AbilityResolver(this, context);
        this.queueStep(resolver);
        return resolver;
    }

    openSimultaneousEffectWindow(choices) {
        throw new Error('Simultaneous effects not implemented yet');
        // let window = new SimultaneousEffectWindow(this);
        // choices.forEach((choice) => window.addToWindow(choice));
        // this.queueStep(window);
    }

    /**
     * Creates a game GameEvent, and opens a window for it.
     * @param {String} eventName
     * @param {Object} params - parameters for this event
     * @param {(GameEvent) => void} handler - (GameEvent + params) => undefined
     * returns {GameEvent} - this allows the caller to track GameEvent.resolved and
     * tell whether or not the handler resolved successfully
     */
    createEventAndOpenWindow(eventName, params = {}, handler = () => true) {
        let event = new GameEvent(eventName, params, handler);
        this.openEventWindow([event]);
        return event;
    }

    /**
     * Directly emits an event to all listeners (does NOT open an event window)
     * @param {String} eventName
     * @param {Object} params - parameters for this event
     */
    emitEvent(eventName, params = {}) {
        let event = new GameEvent(eventName, params);
        this.emit(event.name, event);
    }

    /**
     * Creates an EventWindow which will open windows for each kind of triggered
     * ability which can respond any passed events, and execute their handlers.
     * @param events
     * @returns {EventWindow}
     */
    openEventWindow(events) {
        if (!Array.isArray(events)) {
            events = [events];
        }
        return this.queueStep(new EventWindow(this, events));
    }

    openThenEventWindow(events) {
        if (this.currentEventWindow) {
            if (!Array.isArray(events)) {
                events = [events];
            }
            return this.queueStep(new ThenEventWindow(this, events));
        }
        return this.openEventWindow(events);
    }

    /**
     * Raises a custom event window for checking for any cancels to a card
     * ability
     * @param {Object} params
     * @param {Function} handler - this is an arrow function which is called if
     * nothing cancels the event
     */
    raiseInitiateAbilityEvent(params, handler) {
        this.raiseMultipleInitiateAbilityEvents([{ params: params, handler: handler }]);
    }

    /**
     * Raises a custom event window for checking for any cancels to several card
     * abilities which initiate simultaneously
     * @param {Array} eventProps
     */
    raiseMultipleInitiateAbilityEvents(eventProps) {
        let events = eventProps.map((event) => new InitiateCardAbilityEvent(event.params, event.handler));
        this.queueStep(new InitiateAbilityEventWindow(this, events));
    }

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
    //             array.push(...gameSystem.generateEventsForAllTargets(context));
    //         }
    //         return array;
    //     }, []);
    //     if (events.length > 0) {
    //         this.openEventWindow(events);
    //     }
    //     return events;
    // }

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

        this.playersAndSpectators[user.username] = new Player(socketId, user, this.owner === user.username, this);

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
        }

        player.socket = undefined;
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

    resolveGameState(hasChanged = false, events = []) {
        // check for a game state change (recalculating attack stats if necessary)
        if (
            (!this.currentAttack && this.ongoingEffectEngine.resolveEffects(hasChanged)) ||
            hasChanged
        ) {
            // this.checkWinCondition();
            // if the state has changed, check for:

            // for (const player of this.getPlayers()) {
            //     player.getArenaCards().each((card) => {
            //         if (card.getModifiedController() !== player) {
            //             // any card being controlled by the wrong player
            //             this.takeControl(card.getModifiedController(), card);
            //         }
            //     });
            // }
        }
        if (events.length > 0) {
            // check for any delayed effects which need to fire
            this.ongoingEffectEngine.checkDelayedEffects(events);
        }
    }

    continue() {
        this.pipeline.continue();
    }

    /**
     * Receives data for the token cards and builds a factory method for each type
     * @param {*} tokenCardsData object in the form `{ tokenName: tokenCardData }`
     */
    initialiseTokens(tokenCardsData) {
        for (const tokenName of Object.values(TokenName)) {
            if (!(tokenName in tokenCardsData)) {
                throw new Error(`Token type '${tokenName}' was not included in token data for game initialization`);
            }
        }

        this.tokenFactories = {};

        for (const [tokenName, cardData] of Object.entries(tokenCardsData)) {
            const tokenConstructor = cards.get(cardData.id);

            this.tokenFactories[tokenName] = (player) => new tokenConstructor(player, cardData);
        }
    }

    /**
     * Creates a new shield token in an out of play zone owned by the player and
     * adds it to all relevant card lists
     * @param {Player} player
     * @param {TokenName} tokenName
     * @returns {Shield}
     */
    generateToken(player, tokenName) {
        const token = this.tokenFactories[tokenName](player);

        this.allCards.push(token);
        player.decklist.tokens.push(token);
        player.decklist.allCards.push(token);
        player.outsideTheGameCards.push(token);

        return token;
    }

    /**
     * Removes a shield token from all relevant card lists
     * @param {import('./card/CardTypes.js').TokenCard} token
     */
    removeTokenFromPlay(token) {
        if (
            !Contract.assertEqual(token.location, Location.OutsideTheGame,
                `Tokens must be moved to location ${Location.OutsideTheGame} before removing from play, instead found token at ${token.location}`
            )
        ) {
            return;
        }

        const player = token.owner;
        this.filterCardFromList(token, this.allCards);
        this.filterCardFromList(token, player.decklist.tokens);
        this.filterCardFromList(token, player.decklist.allCards);
        this.filterCardFromList(token, player.outsideTheGameCards);
    }

    filterCardFromList(removeCard, list) {
        list = list.filter((card) => card !== removeCard);
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
    //         winReason: this.winReason,
    //         gameMode: this.gameMode,
    //         finishedAt: this.finishedAt,
    //         roundNumber: this.roundNumber,
    //         initialFirstPlayer: this.initialFirstPlayer
    //     };
    // }

    // /*
    //  * This information is sent to the client
    //  */
    // getState(notInactivePlayerName) {
    //     let activePlayer = this.playersAndSpectators[notInactivePlayerName] || new AnonymousSpectator();
    //     let playerState = {};
    //     let ringState = {};
    //     let conflictState = {};

    //     if (this.started) {
    //         for (const player of this.getPlayers()) {
    //             playerState[player.name] = player.getState(activePlayer);
    //         }

    //         if (this.currentPhase === 'conflict' && this.currentConflict) {
    //             conflictState = this.currentConflict.getSummary();
    //         }

    //         return {
    //             id: this.id,
    //             manualMode: this.manualMode,
    //             name: this.name,
    //             owner: _.omit(this.owner, ['blocklist', 'email', 'emailHash', 'promptedActionWindows', 'settings']),
    //             players: playerState,
    //             rings: ringState,
    //             conflict: conflictState,
    //             phase: this.currentPhase,
    //             messages: this.gameChat.messages,
    //             spectators: this.getSpectators().map((spectator) => {
    //                 return {
    //                     id: spectator.id,
    //                     name: spectator.name
    //                 };
    //             }),
    //             started: this.started,
    //             gameMode: this.gameMode,
    //             winner: this.winner ? this.winner.name : undefined
    //         };
    //     }

    //     return this.getSummary(notInactivePlayerName);
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
