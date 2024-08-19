const { detectBinary } = require('../../build/Util.js');
const { GameMode } = require('../../build/GameMode.js');

class PlayerInteractionWrapper {
    constructor(game, player) {
        this.game = game;
        this.player = player;

        player.noTimer = true;
        player.user = {
            settings: {}
        };
    }

    get name() {
        return this.player.name;
    }

    get hand() {
        return this.player.hand;
    }

    /**
     * Sets the player's hand to contain the specified cards. Moves cards between
     * hand and conflict deck
     * @param {String|DrawCard)[]} [cards] - a list of card names, ids or objects
     */
    setHand(cards = []) {
        //Move all cards in hand to the deck
        var cardsInHand = this.hand;
        cardsInHand.forEach((card) => this.moveCard(card, 'deck'));
        cards = this.mixedListToCardList(cards, 'deck');
        cards.forEach((card) => this.moveCard(card, 'hand'));
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

    /**
     * Gets all cards in play for a player in the space arena
     * @return {BaseCard[]} - List of player's cards currently in play in the space arena
     */
    get spaceArena() {
        return this.player.filterCardsInPlay((card) => card.location === 'space arena');
    }

    setSpaceArenaUnits(newState = []) {
        this.setArenaUnits('space arena', this.spaceArena, newState);
    }

    /**
     * Gets all cards in play for a player in the ground arena
     * @return {BaseCard[]} - List of player's cards currently in play in the ground arena
     */
    get groundArena() {
        return this.player.filterCardsInPlay((card) => card.location === 'ground arena');
    }

    setGroundArenaUnits(newState = []) {
        this.setArenaUnits('ground arena', this.groundArena, newState);
    }

    /**
     * List of objects describing units in play and any upgrades:
     * Either as Object:
     * {
     *    card: String,
     *    exhausted: Boolean
     *    covert: Boolean,
     *    upgrades: String[]
     *  }
     * or String containing name or id of the card
     * @param {String} arenaName - name of the arena to set the units in, either 'ground arena' or 'space arena'
     * @param {DrawCard[]} currentUnitsInArena - list of cards currently in the arena
     * @param {(Object|String)[]} newState - list of cards in play and their states
     */
    setArenaUnits(arenaName, currentUnitsInArena, newState = []) {
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
                throw new Error('You must provide a card name');
            }
            var card = this.findCardByName(options.card, ['deck', 'hand']);
            // Move card to play
            this.moveCard(card, arenaName);
            // Set exhausted state (false by default)
            if (options.exhausted !== undefined) {
                options.exhausted ? card.exhaust() : card.ready();
            } else {
                card.ready();
            }
            // Activate persistent effects of the card
            //card.applyPersistentEffects();
            // Get the upgrades
            if (options.upgrades) {
                var upgrades = [];
                options.upgrades.forEach((card) => {
                    var upgrade = this.findCardByName(card, ['deck', 'hand']);
                    upgrades.push(upgrade);
                });
                // Attach to the card
                upgrades.forEach((upgrade) => {
                    this.player.attach(upgrade, card);
                });
            }
        });

        // TODO EFFECTS: make this part of the normal process of playing a card
        this.game.resolveGameState(true);
    }

    get deck() {
        return this.player.deck;
    }

    get resources() {
        return this.player.resources;
    }

    // TODO: helper method for this
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
    setResourceCards(newContents = []) {
        //  Move cards to the deck
        this.resources.forEach((card) => {
            this.moveCard(card, 'deck');
        });
        // Move cards to the resource area in reverse order
        // (helps with referring to cards by index)
        newContents.reverse().forEach((name) => {
            var card = this.findCardByName(name, ['deck', 'hand']);
            this.moveCard(card, 'resource');
        });
    }

    countSpendableResources() {
        return this.player.countSpendableResources();
    }

    countExhaustedResources() {
        return this.player.countExhaustedResources();
    }

    get discard() {
        return this.player.discard;
    }

    /**
     * Sets the contents of the conflict discard pile
     * @param {String[]} newContents - list of names of cards to be put in conflict discard
     */
    setDiscard(newContents = []) {
        //  Move cards to the deck
        this.discard.forEach((card) => {
            this.moveCard(card, 'deck');
        });
        // Move cards to the discard in reverse order
        // (helps with referring to cards by index)
        newContents.reverse()
            .forEach((name) => {
                var card = this.findCardByName(name, 'deck');
                this.moveCard(card, 'discard');
            });
    }

    get initiativePlayer() {
        return this.game.initiativePlayer;
    }

    get actionPhaseActivePlayer() {
        return this.game.actionPhaseActivePlayer;
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

    formatPrompt() {
        var prompt = this.currentPrompt();
        var selectableCards = this.currentActionTargets;

        if (!prompt) {
            return 'no prompt active';
        }

        return (
            prompt.menuTitle +
            '\n' +
            prompt.buttons.map((button) => '[ ' + button.text + (button.disabled ? ' (disabled)' : '') + ' ]').join(
                '\n'
            ) +
            '\n' +
            selectableCards.map((obj) => obj['name']).join('\n')
        );
    }

    findCardByName(name, locations = 'any', side) {
        return this.filterCardsByName(name, locations, side)[0];
    }

    findAllCardsByName(name, locations = 'any', side) {
        return this.filterCardsByName(name, locations, side);
    }

    /**
     * Filters all of a player's cards using the name and location of a card
     * @param {String} name - the name of the card
     * @param {String[]|String} [locations = 'any'] - locations in which to look for. 'provinces' = 'province 1', 'province 2', etc.
     * @param {?String} side - set to 'opponent' to search in opponent's cards
     */
    filterCardsByName(name, locations = 'any', side) {
        // So that function can accept either lists or single locations
        if (locations !== 'any') {
            if (!Array.isArray(locations)) {
                locations = [locations];
            }
        }
        try {
            var cards = this.filterCards(
                (card) => card.cardData.internalName === name && (locations === 'any' || locations.includes(card.location)),
                side
            );
        } catch (e) {
            throw new Error(`Name: ${name}, Location: ${locations}. Error thrown: ${e}`);
        }
        return cards;
    }

    findCard(condition, side) {
        return this.filterCards(condition, side)[0];
    }

    /**
     *   Filters cards by given condition
     *   @param {function(card: DrawCard)} condition - card matching function
     *   @param {String} [side] - set to 'opponent' to search in opponent's cards
     */
    filterCards(condition, side) {
        var player = this.player;
        if (side === 'opponent') {
            player = this.opponent;
        }
        var cards = player.decklist.allCards.filter(condition);
        if (cards.length === 0) {
            throw new Error(`Could not find any matching cards for ${player.name}`);
        }

        return cards;
    }

    putIntoPlay(card) {
        if (typeof card === 'string') {
            card = this.findCardByName(card);
        }
        if (card.location !== 'play area') {
            this.player.moveCard(card, 'play area');
        }
        card.facedown = false;
        return card;
    }

    hasPrompt(title) {
        var currentPrompt = this.player.currentPrompt();
        return (
            !!currentPrompt &&
            ((currentPrompt.menuTitle && currentPrompt.menuTitle.toLowerCase() === title.toLowerCase()) ||
                (currentPrompt.promptTitle && currentPrompt.promptTitle.toLowerCase() === title.toLowerCase()))
        );
    }

    selectDeck(deck) {
        this.game.selectDeck(this.player.name, deck);
    }

    clickPrompt(text) {
        text = text.toString();
        var currentPrompt = this.player.currentPrompt();
        var promptButton = currentPrompt.buttons.find(
            (button) => button.text.toString().toLowerCase() === text.toLowerCase()
        );

        if (!promptButton || promptButton.disabled) {
            throw new Error(
                `Couldn't click on '${text}' for ${this.player.name}. Current prompt is:\n${this.formatPrompt()}`
            );
        }

        this.game.menuButton(this.player.name, promptButton.arg, promptButton.uuid, promptButton.method);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    passAction() {
        this.clickPrompt('Pass');
    }

    clickPromptButtonIndex(index) {
        var currentPrompt = this.player.currentPrompt();

        if (currentPrompt.buttons.length <= index) {
            throw new Error(
                `Couldn't click on Button '${index}' for ${
                    this.player.name
                }. Current prompt is:\n${this.formatPrompt()}`
            );
        }

        var promptButton = currentPrompt.buttons[index];

        if (!promptButton || promptButton.disabled) {
            throw new Error(
                `Couldn't click on Button '${index}' for ${
                    this.player.name
                }. Current prompt is:\n${this.formatPrompt()}`
            );
        }

        this.game.menuButton(this.player.name, promptButton.arg, promptButton.uuid, promptButton.method);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    chooseCardInPrompt(cardName, controlName) {
        var currentPrompt = this.player.currentPrompt();

        let promptControl = currentPrompt.controls.find(
            (control) => control.name.toLowerCase() === controlName.toLowerCase()
        );

        if (!promptControl) {
            throw new Error(
                `Couldn't click card '${cardName}' for ${
                    this.player.name
                } - unable to find control '${controlName}'. Current prompt is:\n${this.formatPrompt()}`
            );
        }

        this.game.menuButton(this.player.name, cardName, promptControl.uuid, promptControl.method);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    // click any N of the selectable cards available
    // used for randomly selecting resource cards to get through the setup phase
    clickAnyOfSelectableCards(nCardsToChoose) {
        let availableCards = this.currentActionTargets;

        if (!availableCards || availableCards.length < nCardsToChoose) {
            throw new Error(`Insufficient card targets available for control, expected ${nCardsToChoose} found ${availableCards?.length ?? 0} prompt:\n${this.formatPrompt()}`);
        }

        for (let i = 0; i < nCardsToChoose; i++) {
            this.game.cardClicked(this.player.name, availableCards[i].uuid);
        }

        // this.checkUnserializableGameState();
    }

    clickCard(card, location = 'any', side) {
        if (typeof card === 'string') {
            card = this.findCardByName(card, location, side);
        }
        this.game.cardClicked(this.player.name, card.uuid);
        this.game.continue();
        // this.checkUnserializableGameState();
        return card;
    }

    clickRing(element) {
        this.game.ringClicked(this.player.name, element);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    clickMenu(card, menuText) {
        if (typeof card === 'string') {
            card = this.findCardByName(card);
        }

        var items = card.getMenu().filter((item) => item.text === menuText);

        if (items.length === 0) {
            throw new Error(`Card ${card.name} does not have a menu item '${menuText}'`);
        }

        this.game.menuItemClick(this.player.name, card.uuid, items[0]);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    dragCard(card, targetLocation) {
        this.game.drop(this.player.name, card.uuid, card.location, targetLocation);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    /**
     * Moves cards between Location
     * @param {String|DrawCard} card - card to be moved
     * @param {String} targetLocation - location where the card should be moved
     * @param {String | String[]} searchLocations - locations where to find the
     * card object, if card parameter is a String
     */
    moveCard(card, targetLocation, searchLocations = 'any') {
        if (typeof card === 'string') {
            card = this.mixedListToCardList([card], searchLocations)[0];
        }
        this.player.moveCard(card, targetLocation);
        this.game.continue();
        return card;
    }

    togglePromptedActionWindow(window, value) {
        this.player.promptedActionWindows[window] = value;
    }

    /**
     * Player's action of passing priority
     */
    pass() {
        if (!this.canAct) {
            throw new Error(`${this.name} can't pass, because they don't have priority`);
        }
        this.clickPrompt('Pass');
    }

    /**
     *
     */
    setActivePlayer() {
        this.game.actionPhaseActivePlayer = this.player;
        if (this.game.currentActionWindow) {
            this.game.currentActionWindow.activePlayer = this.player;
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
     * @param {String[]|String} locations - list of locations to get card objects from
     */
    mixedListToCardList(mixed, locations = 'any') {
        if (!mixed) {
            return [];
        }
        // Yank all the non-string cards
        var cardList = mixed.filter((card) => typeof card !== 'string');
        mixed = mixed.filter((card) => typeof card === 'string');
        // Find cards objects for the rest
        mixed.forEach((card) => {
            //Find only those cards that aren't already in the list
            var cardObject = this.filterCardsByName(card, locations).find((card) => !cardList.includes(card));
            if (!cardObject) {
                throw new Error(`Could not find card named ${card}`);
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
    //     let state = this.game.getState(this.player.name);
    //     let results = detectBinary(state);
    //     if (results.length !== 0) {
    //         throw new Error('Unable to serialize game state back to client:\n' + JSON.stringify(results));
    //     }
    // }

    reduceDeckToNumber(number) {
        for (let i = this.deck.length - 1; i >= number; i--) {
            this.moveCard(this.deck[i], 'conflict discard pile');
        }
    }
}

module.exports = PlayerInteractionWrapper;
