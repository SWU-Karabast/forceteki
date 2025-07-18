const { ZoneName, DeckZoneDestination, DeployType } = require('../../server/game/core/Constants.js');
const Game = require('../../server/game/core/Game.js');
const { Card } = require('../../server/game/core/card/Card.js');
const { Player } = require('../../server/game/core/Player.js');
const { detectBinary } = require('../../server/Util.js');
const GameFlowWrapper = require('./GameFlowWrapper.js');
const TestSetupError = require('./TestSetupError.js');
const Util = require('./Util.js');

class PlayerInteractionWrapper {
    /**
     *
     * @param {Game} game
     * @param {Player} player
     * @param {GameFlowWrapper} testContext
     */
    constructor(game, player, testContext) {
        this.game = game;
        this.player = player;
        this.testContext = testContext;
    }

    get name() {
        return this.player.user.username;
    }

    get id() {
        return this.player.id;
    }

    /**
     * Moves all cards other than leader + base to the RemovedFromTheGame zone so they can
     * be moved into their proper starting zones for the test.
     */
    moveAllNonBaseZonesToRemoved() {
        this.player.getArenaCards().forEach((card) => this.moveCard(card, 'outsideTheGame'));
        this.player.resourceZone.cards.forEach((card) => this.moveCard(card, 'outsideTheGame'));
        this.player.discardZone.cards.forEach((card) => this.moveCard(card, 'outsideTheGame'));
        this.player.handZone.cards.forEach((card) => this.moveCard(card, 'outsideTheGame'));
        this.player.deckZone.cards.forEach((card) => this.moveCard(card, 'outsideTheGame'));

        Util.refreshGameState(this.game);
    }

    get hand() {
        return this.player.hand;
    }

    /**
     * Sets the player's hand to contain the specified cards. Moves cards between
     * hand and conflict deck
     * @param {String|DrawCard[]} [newContents] - a list of card names or objects
     */
    setHand(newContents = [], prevZones = ['deck']) {
        this.hand.forEach((card) => this.moveCard(card, 'deck'));

        newContents.forEach((nameOrCard) => {
            var card = typeof nameOrCard === 'string' ? this.findCardByName(nameOrCard, prevZones) : nameOrCard;
            this.moveCard(card, 'hand');
        });
    }

    /**
     * Gets the player's base card
     */
    get base() {
        return this.player.base;
    }

    /**
     * Sets the player's base card
     */
    set base(Card) {
        this.player.base = Card;
    }

    /**
     * Gets all cards in play for a player in the space arena
     * @return {BaseCard[]} - List of player's cards currently in play in the space arena
     */
    get inPlay() {
        return this.player.filterCardsInPlay(() => true);
    }

    setLeaderStatus(leaderOptions) {
        if (!leaderOptions) {
            return;
        }

        // leader as a string card name is a no-op unless it doesn't match the existing leader, then throw an error
        if (typeof leaderOptions === 'string') {
            if (leaderOptions !== this.player.leader.internalName) {
                throw new TestSetupError(`Provided leader name ${leaderOptions} does not match player's leader ${this.player.leader.internalName}. Do not try to change leader after test has initialized.`);
            }
            return;
        }

        if (leaderOptions.card !== this.player.leader.internalName) {
            throw new TestSetupError(`Provided leader name ${leaderOptions.card} does not match player's leader ${this.player.leader.internalName}. Do not try to change leader after test has initialized.`);
        }

        var leaderCard = this.player.leader;

        if (leaderOptions.deployed) {
            leaderCard.deploy({ type: DeployType.LeaderUnit });

            // mark the deploy epic action as used
            const deployAbility = leaderCard.getActionAbilities().find((ability) => ability.title.includes('Deploy'));
            deployAbility.limit.increment(this.player);

            leaderCard.damage = leaderOptions.damage || 0;
            leaderCard.exhausted = leaderOptions.exhausted || false;

            // Get the upgrades
            if (leaderOptions.upgrades) {
                this.setCardUpgrades(leaderCard, leaderOptions.upgrades);
            }

            if (leaderOptions.capturedUnits) {
                this.setCapturedUnits(leaderCard, leaderOptions.capturedUnits);
            }
        } else {
            if (leaderOptions.deployed === false) {
                if (leaderCard.deployed === true) {
                    leaderCard.undeploy();
                }
            }
            if (leaderOptions.damage) {
                throw new TestSetupError('Leader should not have damage when not deployed');
            }
            if (leaderOptions.upgrades) {
                throw new TestSetupError('Leader should not have upgrades when not deployed');
            }

            if (leaderOptions.flipped) {
                leaderCard.flipLeader();
            }

            leaderCard.exhausted = leaderOptions.exhausted || false;
        }

        Util.refreshGameState(this.game);
    }

    setBaseStatus(baseOptions) {
        if (!baseOptions) {
            return;
        }
        // base as a string card name is a no-op unless it doesn't match the existing base, then throw an error
        if (typeof baseOptions === 'string') {
            if (baseOptions !== this.player.base.internalName) {
                throw new TestSetupError(`Provided base name ${baseOptions} does not match player's base ${this.player.base.internalName}. Do not try to change base after test has initialized.`);
            }
            return;
        }

        if (baseOptions.card !== this.player.base.internalName) {
            throw new TestSetupError(`Provided base name ${baseOptions.card} does not match player's base ${this.player.base.internalName}. Do not try to change base after test has initialized.`);
        }

        var baseCard = this.player.base;
        baseCard.damage = baseOptions.damage || 0;

        Util.refreshGameState(this.game);
    }

    /**
     * Gets all cards in play for a player in the space arena
     * @return {BaseCard[]} - List of player's cards currently in play in the space arena
     */
    get spaceArena() {
        return this.player.filterCardsInPlay((card) => card.zoneName === 'spaceArena');
    }

    setSpaceArenaUnits(newState = [], prevZones = ['deck', 'hand']) {
        this.setArenaUnits('spaceArena', this.spaceArena, newState, prevZones);
    }

    /**
     * Gets all cards in play for a player in the ground arena
     * @return {BaseCard[]} - List of player's cards currently in play in the ground arena
     */
    get groundArena() {
        return this.player.filterCardsInPlay((card) => card.zoneName === 'groundArena');
    }

    setGroundArenaUnits(newState = [], prevZones = ['deck', 'hand']) {
        this.setArenaUnits('groundArena', this.groundArena, newState, prevZones);
    }

    /**
     * List of objects describing units in play and any upgrades:
     * Either as Object:
     * {
     *    card: String,
     *    exhausted: Boolean
     *    covert: Boolean,
     *    upgrades: String[],
     *    damage: Number
     *  }
     * or String containing name or id of the card
     * @param {String} arenaName - name of the arena to set the units in, either 'groundArena' or 'spaceArena'
     * @param {DrawCard[]} currentUnitsInArena - list of cards currently in the arena
     * @param {(Object|String)[]} newState - list of cards in play and their states
     */
    setArenaUnits(arenaName, currentUnitsInArena, newState = [], prevZones = ['deck', 'hand']) {
        // First, move all cards in play back to the deck
        currentUnitsInArena.forEach((card) => {
            this.moveCard(card, 'deck');
        });
        // Set up each of the cards
        newState.forEach((options) => {
            if (typeof options === 'string') {
                options = {
                    card: options
                };
            }
            if (!options.card) {
                throw new TestSetupError('You must provide a card name');
            }

            const opponentControlled = options.hasOwnProperty('owner') && options.owner !== this.player.name;

            var card;
            if (Util.isTokenUnit(options.card)) {
                card = this.generateToken(this.player, options.card);
            } else {
                card = this.findCardByName(options.card, prevZones, opponentControlled ? 'opponent' : null);
            }

            if (!card.isUnit()) {
                throw new TestSetupError(`Attempting to add non-unit card ${card.internalName} to ${arenaName}`);
            } else if (card.defaultArena !== arenaName) {
                throw new TestSetupError(`Attempting to place ${card.internalName} in invalid arena '${arenaName}'`);
            }

            // Move card to play
            this.moveCard(card, arenaName);

            if (opponentControlled) {
                card.takeControl(card.owner.opponent);
            }

            // Set exhausted state (false by default)
            if (options.exhausted != null) {
                options.exhausted ? card.exhaust() : card.ready();
            } else {
                card.ready();
            }

            if (options.damage != null) {
                card.damage = options.damage;
            }

            if (options.upgrades) {
                this.setCardUpgrades(card, options.upgrades, prevZones);
            }

            if (options.capturedUnits) {
                this.setCapturedUnits(card, options.capturedUnits, prevZones);
            }

            if (options.damage !== undefined) {
                card.damage = options.damage;
            }
        });

        Util.refreshGameState(this.game);
    }

    setCardUpgrades(card, upgrades, prevZones = 'any') {
        for (const upgrade of upgrades) {
            const upgradeName = (typeof upgrade === 'string') ? upgrade : upgrade.card;
            let upgradeCard;
            if (Util.isTokenUpgrade(upgradeName)) {
                upgradeCard = this.generateToken(this.player, upgradeName);
            } else {
                upgradeCard = this.findCardByName(upgradeName, prevZones);
            }

            upgradeCard.attachTo(card);
        }
    }

    setCapturedUnits(card, capturedUnits, prevZones = 'any') {
        for (const capturedUnit of capturedUnits) {
            const capturedUnitName = (typeof capturedUnit === 'string') ? capturedUnit : capturedUnit.card;
            const side = (capturedUnit.hasOwnProperty('owner') && capturedUnit.owner === this.player.name) ? 'self' : 'opponent';
            let capturedUnitCard;
            if (Util.isTokenUnit(capturedUnitName)) {
                throw new TestSetupError(`Attempting to add token unit ${capturedUnitName} to ${card}`);
            } else {
                capturedUnitCard = this.findCardByName(capturedUnitName, prevZones, side);
            }
            capturedUnitCard.moveToCaptureZone(card.captureZone);
        }
    }

    generateToken(player, tokenName) {
        let tokenClassName;
        switch (tokenName) {
            case 'battle-droid':
                tokenClassName = 'battleDroid';
                break;
            case 'clone-trooper':
                tokenClassName = 'cloneTrooper';
                break;
            case 'tie-fighter':
                tokenClassName = 'tieFighter';
                break;
            case 'xwing':
                tokenClassName = 'xwing';
                break;
            case 'experience':
            case 'shield':
                tokenClassName = tokenName;
                break;
            default:
                throw new TestSetupError(`Unknown token type: ${tokenName}`);
        }

        return this.game.generateToken(player, tokenClassName);
    }

    get deck() {
        return this.player.drawDeck;
    }

    setDeck(newContents = [], prevZones = ['any']) {
        this.player.deckZone.cards.forEach(
            (card) => this.moveCard(card, 'outsideTheGame')
        );
        newContents.reverse().forEach((nameOrCard) => {
            var card = typeof nameOrCard === 'string' ? this.findCardByName(nameOrCard, prevZones) : nameOrCard;
            this.moveCard(card, 'deck');
        });
    }

    get resources() {
        return this.player.resources;
    }

    /**
     * Sets the player's resource count to the specified number, using
     * a default card name
     */
    setResourceCount(count) {
        this.setResourceCards(Array(count).fill('underworld-thug'));
    }

    /**
     * List of objects describing cards in resource area
     * Either as Object:
     * {
     *    card: String,
     *    exhausted: Boolean
     *  }
     * or String containing name or id of the card
     * @param {(Object|String)[]} newState - list of cards in play and their states
     */
    setResourceCards(newContents = [], prevZones = ['deck', 'hand']) {
        //  Move cards to the deck
        this.resources.forEach((card) => {
            this.moveCard(card, 'deck');
        });
        // Move cards to the resource area in reverse order
        // (helps with referring to cards by index)
        newContents.reverse().forEach((resource) => {
            const name = typeof resource === 'string' ? resource : resource.card;
            var card = this.findCardByName(name, prevZones);
            this.moveCard(card, 'resource');
            card.exhausted = typeof resource === 'string' ? false : resource.exhausted;
        });
        Util.refreshGameState(this.game);
    }

    attachOpponentOwnedUpgrades(opponentOwnedUpgrades = []) {
        for (const upgrade of opponentOwnedUpgrades) {
            const upgradeCard = this.findCardByName(upgrade.card, 'any', 'opponent');
            const attachedCardAlsoOpponentControlled = upgrade.hasOwnProperty('attachedToOwner') && upgrade.attachedToOwner !== this.player.name;
            const attachTo = attachedCardAlsoOpponentControlled ? this.findCardByName(upgrade.attachedTo, 'any', 'opponent') : this.findCardByName(upgrade.attachedTo);
            upgradeCard.attachTo(attachTo);
        }
    }

    get handSize() {
        return this.player.hand.length;
    }

    get readyResourceCount() {
        return this.player.readyResourceCount;
    }

    get exhaustedResourceCount() {
        return this.player.exhaustedResourceCount;
    }

    get discard() {
        return this.player.discard;
    }

    /**
     * Sets the contents of the conflict discard pile
     * @param {String[]} newContents - list of names of cards to be put in conflict discard
     */
    setDiscard(newContents = [], prevZones = ['deck']) {
        //  Move cards to the deck
        this.discard.forEach((card) => this.moveCard(card, 'deck'));
        // Move cards to the discard in reverse order
        // (helps with referring to cards by index)
        newContents.reverse().forEach((name) => {
            const card = typeof name === 'string' ? this.findCardByName(name, prevZones) : name;
            this.moveCard(card, 'discard');
        });
    }

    get initiativePlayer() {
        return this.game.initiativePlayer;
    }

    get hasInitiative() {
        return this.game.initiativePlayer != null && this.game.initiativePlayer.id === this.player.id;
    }

    get hasTheForce() {
        return this.player.hasTheForce;
    }

    get actionPhaseActivePlayer() {
        return this.game.actionPhaseActivePlayer;
    }

    get activePlayer() {
        return this.game.getActivePlayer();
    }

    get opponent() {
        return this.player.opponent;
    }

    currentPrompt() {
        return this.player.currentPrompt();
    }

    get currentButtons() {
        var buttons = this.currentPrompt().buttons;
        return buttons.map((button) => button.text.toString());
    }

    /**
     * Lists cards selectable by the player during the action
     * @return {DrawCard[]} - selectable cards
     */
    get currentActionTargets() {
        return this.player.promptState.selectableCards;
    }

    /**
     * Lists cards currently selected by the player
     * @return {DrawCard[]} - selected cards
     */
    get selectedCards() {
        return this.player.promptState.selectedCards;
    }

    /**
     * Determines whether a player can initiate actions
     * @return {Boolean} - whether the player can initiate actions or has to wait
     */
    get canAct() {
        return !this.hasPrompt('Waiting for opponent to take an action or pass');
    }

    findCardByName(name, zones = 'any', side) {
        var cards = this.filterCardsByName(name, zones, side);
        // TODO: Update to throw exception when returning more or less than 1 card. This will require updates to the test suite.git
        if (cards.length === 0) {
            throw new TestSetupError(`Could not find any cards matching name ${name}`);
        }
        return cards[0];
    }

    findCardsByName(names, zones = 'any', side) {
        return this.filterCardsByName(names, zones, side);
    }

    /**
     * Filters all of a player's cards using the name and zone of a card
     * @param {String} names - the names of the cards
     * @param {String[]|String} [zones = 'any'] - zones in which to look for. 'provinces' = 'province 1', 'province 2', etc.
     * @param {String?} side - set to 'opponent' to search in opponent's cards
     */
    filterCardsByName(names, zones = 'any', side) {
        // So that function can accept either lists or single zones
        const namesAra = Array.isArray(names) ? names : [names];
        if (zones !== 'any') {
            if (!Array.isArray(zones)) {
                zones = [zones];
            }
        }
        return this.filterCards(
            (card) => namesAra.includes(card.cardData.internalName) && (zones === 'any' || zones.includes(card.zoneName)),
            side
        );
    }

    findCard(condition, side) {
        var cards = this.filterCards(condition, side);
        if (cards.length === 0) {
            throw new TestSetupError('Could not find any matching cards');
        }
        return cards[0];
    }

    /**
     *   Filters cards by given condition
     *   @param {function(card: DrawCard)} condition - card matching function
     *   @param {String} [side] - set to 'opponent' to search in opponent's cards
     *   @returns {any[]}
     */
    filterCards(condition, side) {
        let player = this.player;
        if (side === 'opponent') {
            player = this.opponent;
        }
        return player.decklist.allCards.map(
            (x) => this.game.getFromRef(x)
        ).filter(condition);
    }

    exhaustResources(number) {
        this.player.exhaustResources(number);
        Util.refreshGameState(this.game);
    }

    hasPrompt(title) {
        var currentPrompt = this.player.currentPrompt();

        // Evaluar si menuTitle es una función o un string
        const menuTitle =
    typeof currentPrompt.menuTitle === 'function'
        ? currentPrompt.menuTitle(this.player.context)
        : currentPrompt.menuTitle;

        // Evaluar si promptTitle es una función o un string
        const promptTitle =
    typeof currentPrompt.promptTitle === 'function'
        ? currentPrompt.promptTitle(this.player.context)
        : currentPrompt.promptTitle;

        return (
            !!currentPrompt &&
            (menuTitle && menuTitle.toLowerCase() === title.toLowerCase()) ||
            (menuTitle && (menuTitle.replace('(because you are choosing from a hidden zone you may choose nothing)', '').trim()
                .toLowerCase() === title.toLowerCase())) ||
                (promptTitle && promptTitle.toLowerCase() === title.toLowerCase())
        );
    }

    selectDeck(deck) {
        this.game.selectDeck(this.player.id, deck);
    }

    clickPrompt(text) {
        text = text.toString();
        var currentPrompt = this.player.currentPrompt();
        var promptButton = currentPrompt.buttons.find(
            (button) => button.text.toString().toLowerCase() === text.toLowerCase()
        );

        if (!promptButton || promptButton.disabled) {
            throw new TestSetupError(
                `Couldn't click on '${text}' for ${this.player.name}. Current prompt is:\n${Util.formatBothPlayerPrompts(this.testContext)}`
            );
        }

        this.game.menuButton(this.player.id, promptButton.arg, promptButton.uuid, promptButton.method);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    chooseListOption(text) {
        var currentPrompt = this.player.currentPrompt();
        if (!currentPrompt.dropdownListOptions.includes(text)) {
            throw new TestSetupError(
                `Couldn't choose list option '${text}' for ${this.player.name}. Current prompt is:\n${Util.formatBothPlayerPrompts(this.testContext)}`
            );
        }

        this.game.menuButton(this.player.id, text, currentPrompt.promptUuid);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    setDistributeDamagePromptState(cardDistributionMap) {
        this.setDistributeAmongTargetsPromptState(cardDistributionMap, 'distributeDamage');
    }

    setDistributeIndirectDamagePromptState(cardDistributionMap) {
        this.setDistributeAmongTargetsPromptState(cardDistributionMap, 'distributeIndirectDamage');
    }

    setDistributeHealingPromptState(cardDistributionMap) {
        this.setDistributeAmongTargetsPromptState(cardDistributionMap, 'distributeHealing');
    }

    setDistributeExperiencePromptState(cardDistributionMap) {
        this.setDistributeAmongTargetsPromptState(cardDistributionMap, 'distributeExperience');
    }

    setDistributeAmongTargetsPromptState(cardDistributionMap, type) {
        var currentPrompt = this.player.currentPrompt();

        const cardDistributionArray = [...cardDistributionMap].map(([card, amount]) => ({
            uuid: card.uuid,
            amount
        }));

        const promptResults = {
            valueDistribution: cardDistributionArray,
            type
        };

        this.game.statefulPromptResults(this.player.id, promptResults, currentPrompt.promptUuid);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    clickDisplayCardPromptButton(cardUuid, arg) {
        var currentPrompt = this.player.currentPrompt();

        this.game.perCardMenuButton(this.player.id, arg, cardUuid, currentPrompt.promptUuid);
        this.game.continue();
    }

    clickCardInDisplayCardPrompt(card, allowClickUnselectable = false) {
        Util.checkNullCard(card);

        var currentPrompt = this.player.currentPrompt();

        var clickingCard = currentPrompt.displayCards.find(
            (cardEntry) => cardEntry.cardUuid === card.uuid
        );

        if (!clickingCard || (!allowClickUnselectable && (clickingCard.selectionState === 'unselectable' || clickingCard.selectionState === 'invalid'))) {
            throw new TestSetupError(
                `Couldn't click on '${card.internalName}' in card display prompt for ${this.player.name}. Current prompt is:\n${Util.formatBothPlayerPrompts(this.testContext)}`
            );
        }

        this.game.menuButton(this.player.id, card.uuid, currentPrompt.promptUuid, 'menuButton');
        this.game.continue();

        // this.checkUnserializableGameState();
        return card;
    }

    // click any N of the selectable cards available
    // used for randomly selecting resource cards to get through the setup phase
    clickAnyOfSelectableCards(nCardsToChoose) {
        let availableCards = this.currentActionTargets;

        if (!availableCards || availableCards.length < nCardsToChoose) {
            throw new TestSetupError(`Insufficient card targets available for control, expected ${nCardsToChoose} found ${availableCards?.length ?? 0} prompt:\n${Util.formatBothPlayerPrompts(this.testContext)}`);
        }

        for (let i = 0; i < nCardsToChoose; i++) {
            this.game.cardClicked(this.player.id, availableCards[i].uuid);
        }

        // this.checkUnserializableGameState();
    }

    clickCardNonChecking(card, zone = 'any', side = 'self') {
        this.clickCard(card, zone, side, false);
    }

    clickCard(card, zone = 'any', side = 'self', expectChange = true) {
        Util.checkNullCard(card);

        if (typeof card === 'string') {
            card = this.findCardByName(card, zone, side);
        }

        if (expectChange && !this.currentActionTargets.includes(card)) {
            throw new TestSetupError(
                `Couldn't click on '${card.internalName}' for ${this.player.name}. The card is not selectable!`
            );
        }

        let beforeClick = null;
        if (expectChange) {
            beforeClick = Util.getPlayerPromptState(this.player);
        }

        this.game.cardClicked(this.player.id, card.uuid);
        this.game.continue();

        if (expectChange) {
            const afterClick = Util.getPlayerPromptState(this.player);
            if (Util.promptStatesEqual(beforeClick, afterClick)) {
                throw new TestSetupError(`Nothing happened when ${this.player.name} clicked ${card.internalName} (prompt and board state did not change). Current prompts:\n${Util.formatBothPlayerPrompts(this.testContext)}`);
            }
        }

        // this.checkUnserializableGameState();
        return card;
    }

    clickMenu(card, menuText) {
        if (typeof card === 'string') {
            card = this.findCardByName(card);
        }

        var items = card.getMenu().filter((item) => item.text === menuText);

        if (items.length === 0) {
            throw new TestSetupError(`Card ${card.name} does not have a menu item '${menuText}'`);
        }

        this.game.menuItemClick(this.player.id, card.uuid, items[0]);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    getCardsInZone(zone) {
        return this.player.getCardsInZone(zone);
    }

    getArenaCards() {
        return this.player.getArenaCards();
    }

    dragCard(card, targetZone) {
        this.game.drop(this.player.id, card.uuid, card.zoneName, targetZone);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    /**
     * Moves cards between ZoneName
     * @param {String|DrawCard} card - card to be moved
     * @param {String} targetZone - zone where the card should be moved
     * @param {String | String[]} searchZones - zones where to find the
     * card object, if card parameter is a String
     */
    moveCard(card, targetZone, searchZones = 'any') {
        // TODO: Check that space units can not be added to ground arena and vice versa
        if (!(card instanceof Card)) {
            const cardName = typeof card === 'string' ? card : card.card;
            card = this.mixedListToCardList([cardName], searchZones)[0];
        }
        card.moveTo(targetZone === ZoneName.Deck ? DeckZoneDestination.DeckTop : targetZone);
        this.game.continue();
        return card;
    }

    togglePromptedActionWindow(window, value) {
        this.player.promptedActionWindows[window] = value;
    }

    /**
     * Player's action of passing priority
     */
    passAction() {
        if (!this.canAct) {
            throw new TestSetupError(`${this.name} can't pass, because they don't have priority`);
        }
        this.clickPrompt('Pass');
    }

    /**
     * Player's action of passing priority
     */
    claimInitiative() {
        if (!this.canAct) {
            throw new TestSetupError(`${this.name} can't pass, because they don't have priority`);
        }
        this.clickPrompt('Claim Initiative');
    }

    /**
     *
     */
    setActivePlayer() {
        this.game.actionPhaseActivePlayer = this.player;
        if (this.game.currentActionWindow) {
            this.game.currentActionWindow.activePlayer = this.player;
        }
        Util.refreshGameState(this.game);
    }

    /**
     * Sets the Force Token state for the player
     * @param {Boolean} hasForce - true if the player should have the Force Token
     */
    setHasTheForce(hasForce = true) {
        if (hasForce) {
            if (this.player.hasTheForce) {
                throw new TestSetupError(`Attempting to give Force Token to ${this.player.name}, but they already have it.`);
            }

            const forceTokens = this.player.outsideTheGameZone
                .getCards({ condition: (card) => card.isForceToken() });

            if (forceTokens.length === 0) {
                throw new TestSetupError(`Failed to find a Force Token for ${this.player.name}`);
            }

            forceTokens[0].moveTo(ZoneName.Base);
        } else {
            if (!this.player.hasTheForce) {
                throw new TestSetupError(`Attempting to remove Force Token from ${this.player.name}, but they don't have it.`);
            }
            const forceToken = this.player.baseZone.forceToken;

            if (!forceToken) {
                throw new TestSetupError(`Failed to find a Force Token for ${this.player.name}`);
            }

            forceToken.moveTo(ZoneName.OutsideTheGame);
        }
    }

    playAttachment(attachment, target) {
        let card = this.clickCard(attachment, 'hand');
        if (this.currentButtons.includes('Play ' + card.name + ' as an attachment')) {
            this.clickPrompt('Play ' + card.name + ' as an attachment');
        }
        this.clickCard(target, 'play area');
        return card;
    }

    readyResources(number) {
        this.player.readyResources(number);
        Util.refreshGameState(this.game);
    }

    playCharacterFromHand(card, fate = 0) {
        if (typeof card === 'string') {
            card = this.findCardByName(card, 'hand');
        }
        this.clickCard(card, 'hand');
        if (this.currentButtons.includes('Play this character')) {
            this.clickPrompt('Play this character');
        }
        this.clickPrompt(fate.toString());
        return card;
    }

    /**
     * Converts a mixed list of card objects and card names to a list of card objects
     * @param {(DrawCard|String)[]} mixed - mixed list of cards and names or ids
     * @param {String[]|String} zones - list of zones to get card objects from
     */
    mixedListToCardList(mixed, zones = 'any') {
        if (!mixed) {
            return [];
        }
        // Yank all the non-string cards
        var cardList = mixed.filter((card) => typeof card !== 'string');
        mixed = mixed.filter((card) => typeof card === 'string');
        // Find cards objects for the rest
        mixed.forEach((card) => {
            // Find only those cards that aren't already in the list
            var cardObject = this.filterCardsByName(card, zones).find((card) => !cardList.includes(card));
            if (!cardObject) {
                throw new TestSetupError(`Could not find card named ${card}`);
            }
            cardList.push(cardObject);
        });

        return cardList;
    }

    /**
     * Removes cards unable to participate in a specified type of conflict from a list
     * @param {DrawCard[]} cardList - list of card objects
     * @param {String} type - type of conflict 'military' or 'political'
     */
    filterUnableToParticipate(cardList, type) {
        return cardList.filter((card) => {
            if (!card) {
                return false;
            }
            return !card.hasDash(type);
        });
    }

    // checkUnserializableGameState() {
    //     let state = this.game.getState(this.player.id);
    //     let results = detectBinary(state);
    //     if (results.length !== 0) {
    //         throw new TestSetupError('Unable to serialize game state back to client:\n' + JSON.stringify(results));
    //     }
    // }

    reduceDeckToNumber(number) {
        for (let i = this.deck.length - 1; i >= number; i--) {
            this.moveCard(this.deck[i], 'discard');
        }
    }
}

module.exports = PlayerInteractionWrapper;
