const _ = require('underscore');

const { detectBinary } = require('../../build/util.js');
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
        return this.player.hand.value();
    }

    /**
     * Sets the player's hand to contain the specified cards. Moves cards between
     * hand and conflict deck
     * @param {String|DrawCard)[]} [cards] - a list of card names, ids or objects
     */
    set hand(cards = []) {
        //Move all cards in hand to the deck
        var cardsInHand = this.hand;
        _.each(cardsInHand, (card) => this.moveCard(card, 'deck'));
        cards = this.mixedListToCardList(cards, 'deck');
        _.each(cards, (card) => this.moveCard(card, 'hand'));
    }

    /**
        Sets the contents of a user's provinces
        Does not touch the stronghold. Assumed that the stronghold is set during setup.
        @param {!Object} newProvinceState - new contents of provinces
        @param {Object} newProvinceState['province 1'] - contents of province 1
        @param {String|DrawCard} newProvinceState['province 1'].provinceCard - Province card for province 1
        @param {(String|DrawCard)[]} newProvinceState['province 1'].dynastyCards - list of dynasty cards for province 1
        @param {Object} newProvinceState['province 2'] - contents of province 2
        @param {String|DrawCard} newProvinceState['province 2'].provinceCard - Province card for province 2
        @param {(String|DrawCard)[]} newProvinceState['province 2'].dynastyCards - list of dynasty cards for province 2
        @param {Object} newProvinceState['province 3'] - contents of province 3
        @param {String|DrawCard} newProvinceState['province 3'].provinceCard - Province card for province 3
        @param {(String|DrawCard)[]} newProvinceState['province 3'].dynastyCards - list of dynasty cards for province 3
        @param {Object} newProvinceState['province 4'] - contents of province 4
        @param {String|DrawCard} newProvinceState['province 4'].provinceCard - Province card for province 4
        @param {(String|DrawCard)[]} newProvinceState['province 4'].dynastyCards - list of dynasty cards for province 4
    */
    set provinces(newProvinceState) {
        if (!newProvinceState) {
            return;
        }
        if (_.isArray(newProvinceState)) {
            var provinceObject = {};
            // Convert to an object
            _.each(newProvinceState, (card, index) => {
                provinceObject[`province ${index + 1}`] = { provinceCard: card };
            });
            newProvinceState = provinceObject;
        }
        //Move all province cards to province deck
        var allProvinceLocations = _.keys(this.provinces);
        _.each(this.provinces, (contents) => {
            this.moveCard(contents.provinceCard, 'province deck');
        });
        //Fill the specified provinces
        _.each(newProvinceState, (state, location) => {
            if (!_.contains(allProvinceLocations, location)) {
                throw new Error(`${location} is not a valid province`);
            }
            var provinceCard = state.provinceCard;
            var dynastyCards = state.dynastyCards;
            if (provinceCard) {
                provinceCard = this.mixedListToCardList([provinceCard], 'province deck')[0];
                this.moveCard(provinceCard, location);
            }
            if (dynastyCards) {
                dynastyCards = this.mixedListToCardList(dynastyCards, 'dynasty deck');
                // WIP: Not sure if possible to have >1 dynasty card in a province
                _.each(dynastyCards, (card) => this.placeCardInProvince(card, location));
            }
        });
        //Assign the rest of province cards
        _.each(this.provinces, (state, location) => {
            var provinceCard = state.provinceCard;
            if (!provinceCard) {
                provinceCard = this.provinceDeck[0];
                this.moveCard(provinceCard, location);
            }
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
    set base(newCard) {
        this.player.base = newCard;
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
    
    set spaceArena(newState = []) {
        this.setArenaUnits('space arena', this.spaceArena, newState);
    }

    /**
     * Gets all cards in play for a player in the ground arena
     * @return {BaseCard[]} - List of player's cards currently in play in the ground arena
     */
    get groundArena() {
        return this.player.filterCardsInPlay((card) => card.location === 'ground arena');
    }

    set groundArena(newState = []) {
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
        _.each(currentUnitsInArena, (card) => { this.moveCard(card, 'deck'); });
        // Set up each of the cards
        _.each(newState, (options) => {
            //TODO: Optionally, accept just a string as a parameter???
            if (_.isString(options)) {
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
            // Set exhausted state
            if (options.exhausted !== undefined) {
                options.exhausted ? card.exhaust() : card.ready();
            }
            // Activate persistent effects of the card
            //card.applyPersistentEffects();
            // Get the upgrades
            if (options.upgrades) {
                var upgrades = [];
                _.each(options.upgrades, (card) => {
                    var upgrade = this.findCardByName(card, ['deck', 'hand']);
                    upgrades.push(upgrade);
                });
                // Attach to the card
                _.each(upgrades, (upgrade) => {
                    this.player.attach(upgrade, card);
                });
            }
        });
    }

    get deck() {
        return this.player.deck.value();
    }

    get resources() {
        return this.player.resources.value();
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
    set resources(newContents = []) {
        //  Move cards to the deck
        _.each(this.resources, (card) => {
            this.moveCard(card, 'deck');
        });
        // Move cards to the resource area in reverse order
        // (helps with referring to cards by index)
        _.chain(newContents)
            .reverse()
            .each((name) => {
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
        return this.player.discard.value();
    }

    /**
     * Sets the contents of the conflict discard pile
     * @param {String[]} newContents - list of names of cards to be put in conflict discard
     */
    set discard(newContents = []) {
        //  Move cards to the deck
        _.each(this.discard, (card) => {
            this.moveCard(card, 'deck');
        });
        // Move cards to the discard in reverse order
        // (helps with referring to cards by index)
        _.chain(newContents)
            .reverse()
            .each((name) => {
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
        return _.map(buttons, (button) => button.text.toString());
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
            _.map(prompt.buttons, (button) => '[ ' + button.text + (button.disabled ? ' (disabled)' : '') + ' ]').join(
                '\n'
            ) +
            '\n' +
            _.pluck(selectableCards, 'name').join('\n')
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
            if (!_.isArray(locations)) {
                locations = [locations];
            }
        }
        try {
            var cards = this.filterCards(
                (card) => card.cardData.internalName === name && (locations === 'any' || _.contains(locations, card.location)),
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
        var cards = player.preparedDeck.allCards.filter(condition);
        if (cards.length === 0) {
            throw new Error(`Could not find any matching cards for ${player.name}`);
        }

        return cards;
    }

    placeCardInProvince(card, location = 'province 1') {
        if (_.isString(card)) {
            card = this.findCardByName(card);
        }
        if (!_.contains(['province 1', 'province 2', 'province 3', 'province 4'], location)) {
            throw new Error(`${location} is not a valid province`);
        }
        if (card.location !== location) {
            let oldLocation = card.location;
            if (this.player.getDynastyCardInProvince(location)) {
                this.player.moveCard(this.player.getDynastyCardInProvince(location), 'dynasty deck');
            }
            this.player.moveCard(card, location);
            this.player.replaceDynastyCard(oldLocation);
        }
        card.facedown = false;
        if (this.game.currentPhase !== 'setup') {
            this.game.checkGameState(true);
        }
        return card;
    }

    putIntoPlay(card) {
        if (_.isString(card)) {
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
        var promptButton = _.find(
            currentPrompt.buttons,
            (button) => button.text.toString().toLowerCase() === text.toLowerCase()
        );

        if (!promptButton || promptButton.disabled) {
            throw new Error(
                `Couldn't click on "${text}" for ${this.player.name}. Current prompt is:\n${this.formatPrompt()}`
            );
        }

        this.game.menuButton(this.player.name, promptButton.arg, promptButton.uuid, promptButton.method);
        this.game.continue();
        // this.checkUnserializableGameState();
    }

    clickPromptButtonIndex(index) {
        var currentPrompt = this.player.currentPrompt();

        if (currentPrompt.buttons.length <= index) {
            throw new Error(
                `Couldn't click on Button "${index}" for ${
                    this.player.name
                }. Current prompt is:\n${this.formatPrompt()}`
            );
        }

        var promptButton = currentPrompt.buttons[index];

        if (!promptButton || promptButton.disabled) {
            throw new Error(
                `Couldn't click on Button "${index}" for ${
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

        let promptControl = _.find(
            currentPrompt.controls,
            (control) => control.name.toLowerCase() === controlName.toLowerCase()
        );

        if (!promptControl) {
            throw new Error(
                `Couldn't click card "${cardName}" for ${
                    this.player.name
                } - unable to find control "${controlName}". Current prompt is:\n${this.formatPrompt()}`
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
            throw new Error(`Insufficient card targets available for control, expected ${nCardsToChoose} found ${availableCards?.length ?? 0} prompt:\n${this.formatPrompt()}`)
        }

        for (let i = 0; i < nCardsToChoose; i++) {
            this.game.cardClicked(this.player.name, availableCards[i].uuid);
        }

        // this.checkUnserializableGameState();
    }

    clickCard(card, location = 'any', side) {
        if (_.isString(card)) {
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
        if (_.isString(card)) {
            card = this.findCardByName(card);
        }

        var items = card.getMenu().filter((item) => item.text === menuText);

        if (items.length === 0) {
            throw new Error(`Card ${card.name} does not have a menu item "${menuText}"`);
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
        if (_.isString(card)) {
            card = this.mixedListToCardList([card], searchLocations)[0];
        }
        this.player.moveCard(card, targetLocation);
        this.game.continue();
        return card;
    }

    /**
     * Claims the specified elemental ring for the player
     * @param {String} element - a ring element
     */
    claimRing(element) {
        if (!element) {
            return;
        }
        if (!_.includes(['fire', 'earth', 'water', 'air', 'void'], element)) {
            throw new Error(`${element} is not a valid ring selection`);
        }
        this.game.rings[element].claimRing(this.player);
        this.game.checkGameState(true);
        this.game.continue();
    }
    /**
     * Lists the rings claimed by the player as strings
     * @return {String[]} list of ring elements claimed by the player
     */
    get claimedRings() {
        return this.player.getClaimedRings().map((ring) => ring.element);
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
     * Player's action of passing a conflict
     */
    passConflict() {
        if (!this.hasPrompt('Initiate Conflict')) {
            throw new Error(
                `${this.name} can't pass their conflict, because they are not being prompted to declare one`
            );
        }
        this.clickPrompt('Pass Conflict');
        this.clickPrompt('Yes');
    }

    /**
     * Selects a stronghold province at the beginning of the game
     * @param {!String} card - the province to select
     */
    selectStrongholdProvince(card) {
        if (this.game.gameMode === GameMode.Skirmish) {
            return;
        }
        if (!this.hasPrompt('Select stronghold province')) {
            throw new Error(`${this.name} is not prompted to select a province`);
        }
        card = this.findCardByName(card, 'province deck');
        this.clickCard(card);
        this.clickPrompt('Done');
    }

    /**
     * Bids the specified amount of honor during the draw phase
     * @param {number} [honoramt = 1] - amount of honor to be bid
     */
    bidHonor(honoramt = 1) {
        if (!_.contains(this.currentButtons, honoramt.toString())) {
            throw new Error(`${honoramt} is not a valid selection for ${this.name}`);
        }
        if (honoramt > this.player.deck.conflictCards.length) {
            throw new Error(`${this.name} cannot bid ${honoramt}, because they don't have enough cards in the deck`);
        }
        this.clickPrompt(honoramt);
    }

    /**
     *   Plays a card from provinces during the dynasty phase
     *   @param {String} card - Name or id of the card to be playersInOrder
     *   @param {Number} [fate = 0] - number of additional fate to be placed
     */
    playFromProvinces(card, fate = 0) {
        if (!this.canAct) {
            throw new Error(`${this.name} cannot act`);
        }
        if (fate > 4) {
            throw new Error(`Can't place ${fate} tokens. Currently, up to 4 may be placed`);
        }
        if (this.player.deck.dynastyCards.length <= 0) {
            throw new Error(
                `${this.name} can't play cards from dynasty, because player has no cards to refill the province with`
            );
        }
        var candidates = this.filterCardsByName(card, 'provinces');
        //Remove any face-down cards
        candidates = _.reject(candidates, (card) => card.isFacedown());
        if (candidates.length === 0) {
            throw new Error(`${this.name} cannot play the specified card from the provinces`);
        }
        card = candidates[0];
        this.clickCard(card, 'provinces');
        if (!_.contains(this.currentButtons, fate.toString())) {
            this.clickPrompt('Cancel');
            throw new Error(`Player ${this.name} does not have enough fate to place ${fate} tokens.`);
        }
        this.clickPrompt(fate);
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
        if (_.isString(card)) {
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
      Initiates a conflict for the player
      @param {String} [ring] - element of the ring to initiate on, void by default
      @param {String|DrawCard} [province] - conflict province, defaults to province card in province 1
      @param {String} conflictType - type of conflict ('military' or 'political')
      @param {(String|DrawCard)[]} attackers - list of attackers. can be either names,
        ids, or card objects
     */
    declareConflict(conflictType, province, attackers, ring = 'void') {
        if (!ring || !_.contains(['void', 'fire', 'water', 'air', 'earth'], ring)) {
            throw new Error(`${ring} is not a valid ring selection`);
        }
        if (_.isString(province)) {
            province = this.findCardByName(province, 'any', 'opponent');
        } else if (!province) {
            province = this.findCard((card) => card.isProvince && card.location === 'province 1', 'opponent');
        }
        if (province.isBroken) {
            throw new Error(`Cannot initiate conflict on ${province.name} because it is broken`);
        }
        if (!conflictType || !_.contains(['military', 'political'], conflictType)) {
            throw new Error(`${conflictType} is not a valid conflict type`);
        }
        //Turn to list of card objects
        attackers = this.mixedListToCardList(attackers, 'play area');
        //Filter out those that are unable to participate
        attackers = this.filterUnableToParticipate(attackers, conflictType);

        this.clickRing(ring);
        if (this.game.currentConflict.conflictType !== conflictType) {
            this.clickRing(ring);
        }
        this.clickCard(province);
        if (attackers.length > 0) {
            _.each(attackers, (card) => this.clickCard(card));
            this.clickPrompt('Initiate Conflict');
            if (this.hasPrompt('You still have unused Covert - are you sure?')) {
                this.clickPrompt('Yes');
            }
        }
    }

    /**
        Assigns defenders for the player
        @param {(String|DrawCard)[]} defenders - a list of defender names, ids or
        card objects
     */
    assignDefenders(defenders = []) {
        if (defenders.length !== 0) {
            var conflictType = this.game.currentConflict.conflictType;
            // Turn to list of card objects
            defenders = this.mixedListToCardList(defenders, 'play area');
            // Filter out those that can't participate
            defenders = this.filterUnableToParticipate(defenders, conflictType);
            if (defenders.length === 0) {
                throw new Error(`None of the specified attackers can participate in ${conflictType} conflicts`);
            }

            _.each(defenders, (card) => {
                this.clickCard(card);
            });
        }
        this.clickPrompt('Done');
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
        var cardList = _.reject(mixed, (card) => _.isString(card));
        mixed = _.filter(mixed, (card) => _.isString(card));
        // Find cards objects for the rest
        _.each(mixed, (card) => {
            //Find only those cards that aren't already in the list
            var cardObject = this.filterCardsByName(card, locations).find((card) => !_.contains(cardList, card));
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
        return _.filter(cardList, (card) => {
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
